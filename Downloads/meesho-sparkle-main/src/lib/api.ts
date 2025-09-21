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
  // For Lovable platform, we'll use a mock response
  console.log('Running analysis with payload:', payload);
  
  // Simulate processing time with realistic steps
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate different results based on product category
  const routes = ['A', 'B', 'C'] as const;
  const randomRoute = routes[Math.floor(Math.random() * routes.length)];
  
  const scores = {
    A: { relevance: 0.92, reality: 0.88, quality: 0.85, overall: 0.89 },
    B: { relevance: 0.89, reality: 0.91, quality: 0.87, overall: 0.90 },
    C: { relevance: 0.85, reality: 0.89, quality: 0.92, overall: 0.88 }
  };
  
  const currentScores = scores[randomRoute];
  
  const mockResult: AnalysisResult = {
    run_id: `run_${Date.now()}`,
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
  
  return mockResult;
}

export async function getHistory(): Promise<HistoryEntry[]> {
  // Mock history data for Lovable platform
  const now = Date.now();
  return [
    {
      run_id: 'run_1758453985',
      product_id: 'P12345',
      route: 'B',
      created_at: new Date(now - 300000).toISOString(), // 5 minutes ago
      final_score: 0.89
    },
    {
      run_id: 'run_1758453984',
      product_id: 'P12346',
      route: 'A',
      created_at: new Date(now - 1800000).toISOString(), // 30 minutes ago
      final_score: 0.92
    },
    {
      run_id: 'run_1758453983',
      product_id: 'P12347',
      route: 'C',
      created_at: new Date(now - 3600000).toISOString(), // 1 hour ago
      final_score: 0.85
    },
    {
      run_id: 'run_1758453982',
      product_id: 'P12348',
      route: 'B',
      created_at: new Date(now - 7200000).toISOString(), // 2 hours ago
      final_score: 0.91
    },
    {
      run_id: 'run_1758453981',
      product_id: 'P12349',
      route: 'A',
      created_at: new Date(now - 14400000).toISOString(), // 4 hours ago
      final_score: 0.88
    }
  ];
}

export async function getHistoryDetail(runId: string): Promise<AnalysisResult> {
  // Mock detailed history for Lovable platform
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