# main.py — LangGraph-only Relevance-First Agentic Pipeline (single file)
#
# One-file implementation of the relevance-first image selection chain using LangGraph.
# All major steps (Approval, Prompter, Editor/Generator, Re-Approval) are LLM blocks
# (Gemini). Final state per run is persisted to SQLite. No web server; runs once via
# `python main.py --input payload.json` and prints a compact JSON result.
#
# Notes:
# - Requires: langgraph, google-generativeai, pillow, requests
# - Optional (nice to have): pydantic for types
# - Gemini image-gen/edit APIs evolve; this code tries a direct call and falls back to a
#   safe local edit/generation so the graph still completes during development.
#
# ------------------------------------------------------------

from __future__ import annotations
import os, io, sys, json, argparse, base64, hashlib, sqlite3, time
from typing import Dict, List, Any, TypedDict
from dataclasses import dataclass
from datetime import datetime

import requests
from PIL import Image, ImageEnhance, ImageFilter

# LangGraph
from langgraph.graph import StateGraph, START, END

# Gemini (LLM)
import google.generativeai as genai

# -------------------------------
# Configuration
# -------------------------------
GEMINI_MODEL_TEXT = os.getenv("GEMINI_TEXT_MODEL", "gemini-1.5-flash")
GEMINI_MODEL_VISION = os.getenv("GEMINI_VISION_MODEL", "gemini-1.5-flash")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

DB_PATH = os.getenv("CATALOG_DB", "catalog.sqlite")
CHECKPOINT_PATH = os.getenv("GRAPH_STATE_DB", "state.sqlite")
OUT_DIR = os.getenv("OUT_DIR", "./out")
os.makedirs(OUT_DIR, exist_ok=True)

# Decision thresholds
RELEVANCE_PASS = 0.80
REALITY_PASS   = 0.70
INTEGRITY_PASS = 0.95
QUALITY_SOFT   = 0.50  # advisory only
MAX_ITERS = 2

# Selection weights (relevance/realism over quality)
W_REL, W_REAL, W_QUAL = 0.70, 0.20, 0.10

# -------------------------------
# Helpers
# -------------------------------

def md5(b: bytes) -> str:
    return hashlib.md5(b).hexdigest()


def load_image_bytes(item: Dict[str, Any]) -> bytes:
    if "b64" in item:
        return base64.b64decode(item["b64"])
    if "base64" in item:
        return base64.b64decode(item["base64"])
    if "url" in item:
        r = requests.get(item["url"], timeout=15)
        r.raise_for_status()
        return r.content
    raise ValueError("image item must have url or base64")


def to_gemini_image_part(b: bytes) -> Dict[str, Any]:
    # Guess mime
    mime = "image/jpeg"
    if b[:8] == b"\x89PNG\r\n\x1a\n":
        mime = "image/png"
    return {"mime_type": mime, "data": b}


def safe_json(text: str) -> Any:
    try:
        # Trim possible ```json fences
        t = text.strip()
        if t.startswith("```"):
            t = t.strip("`\n")
            if t.lower().startswith("json"):
                t = t[4:].strip()
        return json.loads(t)
    except Exception:
        return None


def ensure_db():
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS runs (
            run_id TEXT PRIMARY KEY,
            product_id TEXT,
            category TEXT,
            route TEXT,
            best_path TEXT,
            generated INTEGER,
            final_scores_json TEXT,
            feedback_json TEXT,
            graph_state_json TEXT,
            created_at TEXT
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            run_id TEXT,
            product_id TEXT,
            image_hash TEXT,
            source TEXT,
            approval_json TEXT,
            accepted INTEGER,
            created_at TEXT
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS candidates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            run_id TEXT,
            path TEXT,
            mode TEXT,
            scores_json TEXT,
            realism_json TEXT,
            accepted INTEGER,
            iter INTEGER,
            created_at TEXT
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            run_id TEXT,
            role TEXT,
            content TEXT,
            created_at TEXT
        )
        """
    )
    con.commit()
    con.close()


# -------------------------------
# LangGraph State
# -------------------------------
class GraphState(TypedDict, total=False):
    run_id: str
    product_id: str
    category: str
    inputs: List[Dict[str, Any]]  # {url|b64, hash, bytes}
    approval: Dict[str, Any]      # per-image decisions
    decision: Dict[str, Any]      # route, feedback
    iter_count: int
    candidates: List[Dict[str, Any]]
    best: Dict[str, Any]
    messages: List[Dict[str, str]]


# -------------------------------
# Gemini Client
# -------------------------------

def init_gemini():
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY missing in env")
    genai.configure(api_key=GEMINI_API_KEY)


def gemini_text(system: str, user: str) -> str:
    model = genai.GenerativeModel(GEMINI_MODEL_TEXT, system_instruction=system)
    resp = model.generate_content(user)
    return resp.text or ""


def gemini_vision(system: str, user: str, images: List[bytes]) -> str:
    model = genai.GenerativeModel(GEMINI_MODEL_VISION, system_instruction=system)
    parts = [user]
    for b in images:
        parts.append(to_gemini_image_part(b))
    resp = model.generate_content(parts)
    return resp.text or ""


def try_save_image_from_gemini(prompt: str, save_path: str) -> bool:
    # Some SDKs support binary image responses via response_mime_type
    try:
        model = genai.GenerativeModel(GEMINI_MODEL_TEXT)
        resp = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "image/png"},
        )
        # SDK differences: attempt to read binary payload
        if hasattr(resp, "_result") and hasattr(resp._result, "binary"):
            data = resp._result.binary
        elif hasattr(resp, "binary"):
            data = resp.binary
        else:
            data = None
        if data:
            with open(save_path, "wb") as f:
                f.write(data)
            return True
        return False
    except Exception:
        return False


def local_quality_edit(img_bytes: bytes) -> bytes:
    im = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    w, h = im.size
    target = 1024
    scale = target / max(w, h)
    im = im.resize((int(w*scale), int(h*scale)), Image.LANCZOS)
    # mild enhancement
    im = ImageEnhance.Brightness(im).enhance(1.05)
    im = ImageEnhance.Contrast(im).enhance(1.1)
    im = ImageEnhance.Sharpness(im).enhance(1.15)
    canvas = Image.new("RGB", (1024, 1024), (245, 245, 245))
    x = (1024 - im.size[0]) // 2
    y = (1024 - im.size[1]) // 2
    canvas.paste(im, (x, y))
    buf = io.BytesIO()
    canvas.save(buf, format="PNG")
    return buf.getvalue()


def local_generate_placeholder(category: str) -> bytes:
    im = Image.new("RGB", (1024, 1024), (250, 250, 250))
    # Simple neutral packshot placeholder
    draw = Image.new("RGB", (600, 600), (235, 235, 235))
    im.paste(draw, (212, 212))
    buf = io.BytesIO()
    im.save(buf, format="PNG")
    return buf.getvalue()


# -------------------------------
# LLM Prompts (strings)
# -------------------------------
APPROVAL_SYSTEM = (
    "You are a marketplace catalog reviewer. Prioritize RELEVANCE and REALISM over pure technical quality.\n"
    "Return strict JSON as requested."
)

APPROVAL_USER_TEMPLATE = (
    "Category: {category}\n"
    "Goal: choose the best feed cover OR return feedback.\n\n"
    "For EACH image, produce an object:\n"
    "{{\n  'image_hash': str,\n  'relevance': float,\n  'reality': float,\n  'integrity': float,\n  'quality': float,\n  'verdict': 'APPROVE'|'NEEDS_EDIT'|'NEEDS_COMPLETE_CHANGE',\n  'reasons': [str,...]\n}}\n\n"
    "Rules:\n- Apparel: prefer on-model or presenter-holding; flat-lay only if nothing else exists.\n"
    "- Non-apparel: centered packshot/studio style.\n- Reality means photorealistic, not CGI/cartoon.\n- Integrity means product identity preserved (color/pattern/shape).\n- Quality is advisory only.\n\n"
    "After listing all per-image objects as 'per_image', also return a 'global' object:\n"
    "{{\n  'decision': 'APPROVED'|'NEEDS_EDIT'|'NEEDS_COMPLETE_CHANGE',\n  'chosen_image_hash': str|null,\n  'edit_brief': str|null,\n  'gen_brief': str|null\n}}\n\n"
    "Output JSON with keys: per_image (list), global (object)."
)

PROMPTER_EDIT_SYSTEM = (
    "You are an e-commerce retouch lead. Write a precise edit brief that keeps product pixels unchanged."
)
PROMPTER_EDIT_USER = (
    "Context feedback:\n{feedback}\n\n"
    "Return JSON like:\n{{\n  'mode': 'quality_edit',\n  'keep_product_pixels': true,\n  'operations': ['exposure_correct','white_balance','mild_denoise','mild_sharpen','neutral_studio_bg','soft_shadow','center_crop_1x1'],\n  'hard_negatives': ['cartoon','illustration','3D render','CGI','over-airbrushed skin','added text'],\n  'acceptance': 'Re-approval must hit Relevance≥0.8, Reality≥0.7, Integrity≥0.95.'\n}}\n"
)

PROMPTER_GEN_SYSTEM = (
    "You are an e-commerce art director. Write a generation plan that keeps product identity faithful."
)
PROMPTER_GEN_USER = (
    "Context feedback:\n{feedback}\nCategory: {category}\n\n"
    "Return JSON like:\n{{\n  'mode': 'compose_new',\n  'scene': 'presenter_holding' or 'on_model' or 'studio_packshot',\n  'background': 'neutral_studio_offwhite',\n  'camera': 'front, 50mm eq',\n  'lighting': 'softbox both sides, soft shadows',\n  'crop': '1x1 centered',\n  'preserve': ['color','pattern','silhouette'],\n  'forbid': ['logos','added text','CGI vibe'],\n  'acceptance': 'Re-approval must hit Relevance≥0.8, Reality≥0.7, Integrity≥0.95.'\n}}\n"
)

EDITOR_SYSTEM = (
    "You are a professional photo editor. Obey the edit plan. Do NOT repaint product pixels."
)
EDITOR_USER = (
    "Apply this edit plan to the attached image and return 1–2 photorealistic PNGs (1024x1024):\n{plan}\n"
)

GENERATOR_SYSTEM = (
    "Produce a photorealistic marketplace cover image. Maintain product identity."
)
GENERATOR_USER = (
    "Create 2 candidates at 1024x1024 using this plan:\n{plan}\n"
)

REAPPROVAL_SYSTEM = APPROVAL_SYSTEM
REAPPROVAL_USER = (
    "Re-evaluate these candidate images for approval using the same JSON schema as before.\n"
)

# -------------------------------
# Node implementations
# -------------------------------

def node_ingest(state: GraphState) -> GraphState:
    run_id = state.get("run_id") or f"run_{int(time.time())}"
    state["run_id"] = run_id
    inputs = state.get("inputs") or []
    processed = []
    for item in inputs:
        b = load_image_bytes(item)
        h = md5(b)
        processed.append({"hash": h, "bytes": b, "source": item.get("url", "b64")})
    state["inputs"] = processed
    state.setdefault("messages", []).append({"role": "system", "content": f"Ingested {len(processed)} images"})
    return state


def node_approval(state: GraphState) -> GraphState:
    init_gemini()
    imgs = [x["bytes"] for x in state["inputs"]]
    user = APPROVAL_USER_TEMPLATE.format(category=state.get("category", "unknown"))
    resp = gemini_vision(APPROVAL_SYSTEM, user, imgs)
    data = safe_json(resp)
    if not data:
        # fail open: mark all as needs complete change
        per_image = []
        for x in state["inputs"]:
            per_image.append({
                "image_hash": x["hash"], "relevance": 0.0, "reality": 0.0, "integrity": 1.0,
                "quality": 0.5, "verdict": "NEEDS_COMPLETE_CHANGE", "reasons": ["llm_parse_error"]
            })
        data = {"per_image": per_image, "global": {"decision": "NEEDS_COMPLETE_CHANGE", "chosen_image_hash": None, "edit_brief": None, "gen_brief": "could not parse"}}
    state["approval"] = {d["image_hash"]: d for d in data.get("per_image", [])}
    g = data.get("global", {})

    # Compute route if not provided or to enforce thresholds
    approved_hash = None
    best_score, best_hash = -1.0, None
    for x in data.get("per_image", []):
        final = W_REL*x.get("relevance",0) + W_REAL*x.get("reality",0) + W_QUAL*x.get("quality",0)
        if final > best_score:
            best_score, best_hash = final, x["image_hash"]
        if x.get("relevance",0) >= RELEVANCE_PASS and x.get("reality",0) >= REALITY_PASS and x.get("integrity",1) >= INTEGRITY_PASS:
            approved_hash = x["image_hash"]

    if approved_hash:
        route = "APPROVED"
        decision_feedback = {"why": ["meets relevance, reality, integrity"], "next_action": "OUTPUT"}
        chosen = approved_hash
    else:
        # Decide between EDIT vs GENERATE using LLM global decision or heuristic
        route = g.get("decision") or "NEEDS_COMPLETE_CHANGE"
        if route not in ("NEEDS_EDIT","NEEDS_COMPLETE_CHANGE"):
            # Heuristic: if any image relevance >= 0.6 then EDIT else GENERATE
            route = "NEEDS_EDIT" if any(x.get("relevance",0)>=0.6 for x in data.get("per_image", [])) else "NEEDS_COMPLETE_CHANGE"
        chosen = best_hash
        decision_feedback = {
            "why": list({r for x in data.get("per_image", []) for r in x.get("reasons",[])}) or ["not suitable as feed cover"],
            "next_action": "EDIT" if route=="NEEDS_EDIT" else "GENERATE",
            "required_changes": [g.get("edit_brief") or g.get("gen_brief") or "see per-image reasons"],
            "acceptance_thresholds": {"relevance": RELEVANCE_PASS, "reality": REALITY_PASS, "integrity": INTEGRITY_PASS}
        }

    state["decision"] = {"route": route, "chosen": chosen, "feedback": decision_feedback}
    state.setdefault("messages", []).append({"role": "assistant", "content": json.dumps({"approval": data})})
    state["iter_count"] = 0
    return state


def router(state: GraphState) -> str:
    route = state.get("decision",{}).get("route")
    if route == "APPROVED":
        return "select_best"
    if route == "NEEDS_EDIT":
        return "prompter_edit"
    return "prompter_generate"


# ------- Case A: Select best original -------

def node_select_best(state: GraphState) -> GraphState:
    # highest Final = 0.70*Rel + 0.20*Reality + 0.10*Quality
    best_score, best = -1.0, None
    for x in state["inputs"]:
        a = state["approval"].get(x["hash"], {})
        final = W_REL*a.get("relevance",0) + W_REAL*a.get("reality",0) + W_QUAL*a.get("quality",0)
        if final > best_score:
            best_score, best = final, x
    state["best"] = {"generated": False, "path": None, "source_hash": best["hash"], "final_score": round(best_score,3)}
    state["decision"]["route"] = "A"
    return state


# ------- Case B: Edit (Prompter -> Editor -> Re-Approval loop) -------

def node_prompter_edit(state: GraphState) -> GraphState:
    init_gemini()
    feedback = json.dumps(state["decision"].get("feedback", {}))
    resp = gemini_text(PROMPTER_EDIT_SYSTEM, PROMPTER_EDIT_USER.format(feedback=feedback))
    plan = safe_json(resp) or {"mode":"quality_edit","keep_product_pixels":True,"operations":["exposure_correct","white_balance","mild_denoise","mild_sharpen","neutral_studio_bg","soft_shadow","center_crop_1x1"],"hard_negatives":["cartoon","CGI"],"acceptance":"Re-approval must hit thresholds"}
    state["messages"].append({"role": "assistant", "content": json.dumps({"edit_plan": plan})})
    state["_edit_plan"] = plan
    return state


def node_editor(state: GraphState) -> GraphState:
    # choose base: decision['chosen'] or first input
    base_hash = state["decision"].get("chosen") or state["inputs"][0]["hash"]
    base = next(x for x in state["inputs"] if x["hash"]==base_hash)
    plan = json.dumps(state.get("_edit_plan", {}))

    # Try Gemini edit (SDKs vary; if it fails, do a local non-destructive enhancement)
    out_path = os.path.join(OUT_DIR, f"edit_{state['run_id']}_iter{state['iter_count']}.png")
    ok = False
    try:
        model = genai.GenerativeModel(GEMINI_MODEL_VISION, system_instruction=EDITOR_SYSTEM)
        parts = [EDITOR_USER.format(plan=plan), to_gemini_image_part(base["bytes"])]
        resp = model.generate_content(parts, generation_config={"response_mime_type":"image/png"})
        data = None
        if hasattr(resp, "_result") and hasattr(resp._result, "binary"):
            data = resp._result.binary
        elif hasattr(resp, "binary"):
            data = resp.binary
        if data:
            with open(out_path, "wb") as f:
                f.write(data)
            ok = True
    except Exception:
        ok = False

    if not ok:
        # local fallback enhancement
        edited = local_quality_edit(base["bytes"])
        with open(out_path, "wb") as f:
            f.write(edited)

    cand = {"path": out_path, "mode":"edit", "iter": state.get("iter_count",0)}
    state.setdefault("candidates", []).append(cand)
    return state


def node_reapproval(state: GraphState) -> GraphState:
    init_gemini()
    # Load candidate image bytes
    cand = state["candidates"][-1]
    with open(cand["path"], "rb") as f:
        b = f.read()
    text = REAPPROVAL_USER
    resp = gemini_vision(REAPPROVAL_SYSTEM, text, [b])
    data = safe_json(resp)
    # Expect same schema (per_image + global). If missing, assume not approved
    approved = False
    scores = {"relevance":0,"reality":0,"integrity":0,"quality":0}
    if data and data.get("per_image"):
        x = data["per_image"][0]
        scores = {k: float(x.get(k,0)) for k in ("relevance","reality","integrity","quality")}
        if (scores["relevance"]>=RELEVANCE_PASS and scores["reality"]>=REALITY_PASS and scores["integrity"]>=INTEGRITY_PASS):
            approved = True
    # Update candidate meta
    cand.update({"scores": scores, "approved": approved})

    if approved:
        state["best"] = {"generated": True, "path": cand["path"], "source_hash": None, "final_score": round(W_REL*scores['relevance']+W_REAL*scores['reality']+W_QUAL*scores['quality'],3)}
        # Label route depending on chain we are in (B for edit path, C for compose path handled by caller)
        if state.get("decision",{}).get("route") == "NEEDS_EDIT":
            state["decision"]["route"] = "B"
        else:
            state["decision"]["route"] = "C"
        return state

    # Not approved → iterate or stop
    it = state.get("iter_count",0)
    if it+1 < MAX_ITERS:
        state["iter_count"] = it+1
        # stay in same chain; set feedback for next prompter
        fb = {"why": ["candidate not yet meeting thresholds"], "next_action": state.get("decision",{}).get("route","NEEDS_EDIT")}
        state["decision"]["feedback"] = fb
        return state  # router in graph will loop to proper prompter
    # stop after MAX_ITERS
    # choose best we have (the last one)
    state["best"] = {"generated": True, "path": cand["path"], "source_hash": None, "final_score": round(W_REL*scores['relevance']+W_REAL*scores['reality']+W_QUAL*scores['quality'],3), "warning":"max_iters_reached"}
    if state.get("decision",{}).get("route") == "NEEDS_EDIT":
        state["decision"]["route"] = "B"
    else:
        state["decision"]["route"] = "C"
    return state


# ------- Case C: Generate (Prompter -> Generator -> Re-Approval) -------

def node_prompter_generate(state: GraphState) -> GraphState:
    init_gemini()
    feedback = json.dumps(state["decision"].get("feedback", {}))
    user = PROMPTER_GEN_USER.format(feedback=feedback, category=state.get("category","unknown"))
    resp = gemini_text(PROMPTER_GEN_SYSTEM, user)
    plan = safe_json(resp) or {"mode":"compose_new","scene":"presenter_holding","background":"neutral_studio_offwhite","camera":"front","lighting":"soft","crop":"1x1 centered","preserve":["color","pattern","silhouette"],"forbid":["logos","CGI vibe"]}
    state["messages"].append({"role": "assistant", "content": json.dumps({"gen_plan": plan})})
    state["_gen_plan"] = plan
    return state


def node_generator(state: GraphState) -> GraphState:
    plan = json.dumps(state.get("_gen_plan", {}))
    out_path = os.path.join(OUT_DIR, f"gen_{state['run_id']}_iter{state['iter_count']}.png")

    # Try Gemini image generation; fallback to local placeholder
    ok = try_save_image_from_gemini(GENERATOR_USER.format(plan=plan), out_path)
    if not ok:
        with open(out_path, "wb") as f:
            f.write(local_generate_placeholder(state.get("category","product")))

    cand = {"path": out_path, "mode":"generate", "iter": state.get("iter_count",0)}
    state.setdefault("candidates", []).append(cand)
    return state


# ------- Persist -------

def node_persist(state: GraphState) -> GraphState:
    ensure_db()
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    now = datetime.utcnow().isoformat()
    run_id = state["run_id"]
    route = state.get("decision",{}).get("route")
    best = state.get("best",{})
    final_scores_json = json.dumps({"final": best.get("final_score")})
    feedback_json = json.dumps(state.get("decision",{}).get("feedback", {}))
    graph_state_json = json.dumps({k:v for k,v in state.items() if k!="inputs"})  # avoid raw bytes in DB

    cur.execute("INSERT OR REPLACE INTO runs(run_id,product_id,category,route,best_path,generated,final_scores_json,feedback_json,graph_state_json,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
                (run_id, state.get("product_id"), state.get("category"), route, best.get("path"), 1 if best.get("generated") else 0, final_scores_json, feedback_json, graph_state_json, now))

    # per-image approvals
    for x in state.get("inputs", []):
        h = x["hash"]
        appr = json.dumps(state.get("approval",{}).get(h, {}))
        accepted = 1 if (not best.get("generated") and best.get("source_hash") == h) else 0
        cur.execute("INSERT INTO images(run_id,product_id,image_hash,source,approval_json,accepted,created_at) VALUES (?,?,?,?,?,?,?)",
                    (run_id, state.get("product_id"), h, x.get("source",""), appr, accepted, now))

    # candidates
    for c in state.get("candidates", []):
        cur.execute("INSERT INTO candidates(run_id,path,mode,scores_json,realism_json,accepted,iter,created_at) VALUES (?,?,?,?,?,?,?,?)",
                    (run_id, c.get("path"), c.get("mode"), json.dumps(c.get("scores",{})), json.dumps(c.get("realism",{})), 1 if (best.get("path")==c.get("path")) else 0, c.get("iter",0), now))

    # messages
    for m in state.get("messages", []):
        cur.execute("INSERT INTO messages(run_id,role,content,created_at) VALUES (?,?,?,?)", (run_id, m.get("role","system"), m.get("content",""), now))

    con.commit(); con.close()
    state["messages"].append({"role":"system","content":"persisted to DB"})
    return state


# -------------------------------
# Build the graph
# -------------------------------

def build_app():
    g = StateGraph(GraphState)

    g.add_node("ingest", node_ingest)
    g.add_node("approval", node_approval)

    # Branches
    g.add_node("select_best", node_select_best)

    # Edit chain
    g.add_node("prompter_edit", node_prompter_edit)
    g.add_node("editor", node_editor)
    g.add_node("reapproval", node_reapproval)

    # Generate chain
    g.add_node("prompter_generate", node_prompter_generate)
    g.add_node("generator", node_generator)

    # Persist
    g.add_node("persist", node_persist)

    g.add_edge(START, "ingest")
    g.add_edge("ingest", "approval")
    g.add_conditional_edges("approval", router, {"select_best":"select_best", "prompter_edit":"prompter_edit", "prompter_generate":"prompter_generate"})

    # Case A
    g.add_edge("select_best", "persist")
    g.add_edge("persist", END)

    # Case B (loop)
    g.add_edge("prompter_edit", "editor")
    g.add_edge("editor", "reapproval")
    # reapproval decides whether to loop back to prompter_edit or move to persist
    def after_reapproval(state: GraphState) -> str:
        # if best set → persist; else loop back to same chain based on decision.route
        if state.get("best"):
            return "persist"
        # loop to the correct prompter per original route
        route = state.get("decision",{}).get("route")
        return "prompter_edit" if route=="NEEDS_EDIT" else "prompter_generate"
    g.add_conditional_edges("reapproval", after_reapproval, {"persist":"persist", "prompter_edit":"prompter_edit", "prompter_generate":"prompter_generate"})

    # Case C (loop)
    g.add_edge("prompter_generate", "generator")
    g.add_edge("generator", "reapproval")

    return g.compile()


# -------------------------------
# Runner
# -------------------------------

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=False, help="path to JSON payload, or read stdin if omitted")
    args = parser.parse_args()

    if args.input:
        with open(args.input, "r", encoding="utf-8") as f:
            payload = json.load(f)
    else:
        payload = json.load(sys.stdin)

    # Build initial state
    init_state: GraphState = {
        "product_id": payload["product_id"],
        "category": payload.get("category","unknown"),
        "inputs": payload.get("images", []),
        "messages": [],
    }

    app = build_app()
    final = app.invoke(init_state, config={"configurable": {"thread_id": payload.get("product_id","thread")}})

    # Compact result
    out = {
        "run_id": final.get("run_id"),
        "product_id": final.get("product_id"),
        "route": final.get("decision",{}).get("route"),
        "best": final.get("best",{}),
        "iterations": final.get("iter_count",0),
        "candidates": [{"path": c.get("path"), "mode": c.get("mode"), "iter": c.get("iter")} for c in final.get("candidates",[])],
        "feedback": final.get("decision",{}).get("feedback",{}),
    }
    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()
