export interface AnalysisPayload {
  product_id: string;
  category: string;
  images: Array<{ b64: string }>;
  meta: { allow_wear: boolean };
}

export interface AnalysisResult {
  run_id: string;
  product_id: string;
  route: 'A' | 'B' | 'C';
  best: {
    generated: boolean;
    path: string;
    source_hash: string;
    final_score: number;
  };
  iterations: number;
  candidates: Array<{
    path: string;
    mode: 'edit' | 'generate';
    iter: number;
  }>;
  feedback: {
    why: string[];
    required_changes: string[];
  };
}

export interface HistoryEntry {
  run_id: string;
  product_id: string;
  route: string;
  created_at: string;
  final_score: number;
}

export async function runAnalysis(payload: AnalysisPayload): Promise<AnalysisResult> {
  const response = await fetch('/api/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getHistory(): Promise<HistoryEntry[]> {
  const response = await fetch('/api/history');
  if (!response.ok) {
    throw new Error(`Failed to fetch history: ${response.statusText}`);
  }
  return response.json();
}

export async function getHistoryDetail(runId: string): Promise<AnalysisResult> {
  const response = await fetch(`/api/history/${runId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch history detail: ${response.statusText}`);
  }
  return response.json();
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:image/type;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}