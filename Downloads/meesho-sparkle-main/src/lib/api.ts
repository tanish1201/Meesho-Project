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
  // For Lovable platform, we'll use a mock response for now
  // In production, this would call the actual Python backend
  console.log('Running analysis with payload:', payload);
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return mock result based on the payload
  const mockResult: AnalysisResult = {
    run_id: `run_${Date.now()}`,
    product_id: payload.product_id,
    route: 'B', // Mock route B (AI Enhancement)
    best: {
      generated: true,
      path: '/mock-output.png',
      source_hash: 'mock_hash',
      final_score: 0.89
    },
    iterations: 1,
    candidates: [
      {
        path: '/mock-candidate1.png',
        mode: 'edit',
        iter: 0
      }
    ],
    feedback: {
      why: ['Image quality enhanced with AI', 'Better lighting and composition'],
      required_changes: ['Enhanced contrast', 'Improved background']
    }
  };
  
  return mockResult;
}

export async function getHistory(): Promise<HistoryEntry[]> {
  // Mock history data for Lovable platform
  return [
    {
      run_id: 'run_1758453985',
      product_id: 'P12345',
      route: 'B',
      created_at: new Date().toISOString(),
      final_score: 0.89
    },
    {
      run_id: 'run_1758453984',
      product_id: 'P12346',
      route: 'A',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      final_score: 0.92
    },
    {
      run_id: 'run_1758453983',
      product_id: 'P12347',
      route: 'C',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      final_score: 0.85
    }
  ];
}

export async function getHistoryDetail(runId: string): Promise<AnalysisResult> {
  // Mock detailed history for Lovable platform
  return {
    run_id: runId,
    product_id: 'P12345',
    route: 'B',
    best: {
      generated: true,
      path: '/mock-output.png',
      source_hash: 'mock_hash',
      final_score: 0.89
    },
    iterations: 1,
    candidates: [
      {
        path: '/mock-candidate1.png',
        mode: 'edit',
        iter: 0
      }
    ],
    feedback: {
      why: ['Image quality enhanced with AI', 'Better lighting and composition'],
      required_changes: ['Enhanced contrast', 'Improved background']
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