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
  console.log('🚀 MOCK ANALYSIS STARTED - No HTTP requests will be made');
  console.log('📦 Payload received:', payload);
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate random route
  const routes = ['A', 'B', 'C'] as const;
  const randomRoute = routes[Math.floor(Math.random() * routes.length)];
  
  // Generate scores based on route
  const scores = {
    A: { relevance: 0.92, reality: 0.88, quality: 0.85, overall: 0.89 },
    B: { relevance: 0.89, reality: 0.91, quality: 0.87, overall: 0.90 },
    C: { relevance: 0.85, reality: 0.89, quality: 0.92, overall: 0.88 }
  };
  
  const currentScores = scores[randomRoute];
  
  const result: AnalysisResult = {
    run_id: `mock_run_${Date.now()}`,
    product_id: payload.product_id,
    route: randomRoute,
    best: {
      generated: randomRoute !== 'A',
      path: `/mock-output-${randomRoute.toLowerCase()}.png`,
      source_hash: randomRoute === 'A' ? 'original_hash' : null,
      final_score: currentScores.overall
    },
    iterations: randomRoute === 'A' ? 0 : 1,
    candidates: randomRoute === 'A' ? [] : [
      {
        path: `/mock-candidate-${randomRoute.toLowerCase()}.png`,
        mode: randomRoute === 'B' ? 'edit' : 'generate',
        iter: 0
      }
    ],
    feedback: {
      why: randomRoute === 'A' 
        ? ['Original image meets quality standards', 'No enhancement needed']
        : randomRoute === 'B'
        ? ['AI enhancement improved image quality', 'Better lighting and composition', 'Enhanced product visibility']
        : ['AI generated new presentation', 'Improved marketplace appeal', 'Better product showcase'],
      required_changes: randomRoute === 'A' 
        ? []
        : randomRoute === 'B'
        ? ['Enhanced contrast', 'Improved background', 'Better lighting']
        : ['New composition', 'Enhanced styling', 'Improved presentation']
    }
  };
  
  console.log('✅ MOCK ANALYSIS COMPLETED:', result);
  return result;
}

export async function getHistory(): Promise<HistoryEntry[]> {
  console.log('📚 MOCK HISTORY REQUESTED - No HTTP requests will be made');
  
  const now = Date.now();
  return [
    {
      run_id: 'mock_run_1',
      product_id: 'P12345',
      route: 'B',
      created_at: new Date(now - 300000).toISOString(),
      final_score: 0.89
    },
    {
      run_id: 'mock_run_2',
      product_id: 'P12346',
      route: 'A',
      created_at: new Date(now - 1800000).toISOString(),
      final_score: 0.92
    },
    {
      run_id: 'mock_run_3',
      product_id: 'P12347',
      route: 'C',
      created_at: new Date(now - 3600000).toISOString(),
      final_score: 0.85
    }
  ];
}

export async function getHistoryDetail(runId: string): Promise<AnalysisResult> {
  console.log('🔍 MOCK HISTORY DETAIL REQUESTED - No HTTP requests will be made');
  
  const routes = ['A', 'B', 'C'] as const;
  const randomRoute = routes[Math.floor(Math.random() * routes.length)];
  
  const scores = {
    A: { relevance: 0.92, reality: 0.88, quality: 0.85, overall: 0.89 },
    B: { relevance: 0.89, reality: 0.91, quality: 0.87, overall: 0.90 },
    C: { relevance: 0.85, reality: 0.89, quality: 0.92, overall: 0.88 }
  };
  
  const currentScores = scores[randomRoute];
  
  return {
    run_id: runId,
    product_id: 'P12345',
    route: randomRoute,
    best: {
      generated: randomRoute !== 'A',
      path: `/mock-output-${randomRoute.toLowerCase()}.png`,
      source_hash: randomRoute === 'A' ? 'original_hash' : null,
      final_score: currentScores.overall
    },
    iterations: randomRoute === 'A' ? 0 : 1,
    candidates: randomRoute === 'A' ? [] : [
      {
        path: `/mock-candidate-${randomRoute.toLowerCase()}.png`,
        mode: randomRoute === 'B' ? 'edit' : 'generate',
        iter: 0
      }
    ],
    feedback: {
      why: randomRoute === 'A' 
        ? ['Original image meets quality standards', 'No enhancement needed']
        : randomRoute === 'B'
        ? ['AI enhancement improved image quality', 'Better lighting and composition', 'Enhanced product visibility']
        : ['AI generated new presentation', 'Improved marketplace appeal', 'Better product showcase'],
      required_changes: randomRoute === 'A' 
        ? []
        : randomRoute === 'B'
        ? ['Enhanced contrast', 'Improved background', 'Better lighting']
        : ['New composition', 'Enhanced styling', 'Improved presentation']
    }
  };
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