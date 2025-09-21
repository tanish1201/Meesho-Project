import type { NextApiRequest, NextApiResponse } from 'next';
import { runPythonAnalysis } from '../../src/server/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { product_id, category, images, meta } = req.body;

    if (!product_id || !category || !images || !Array.isArray(images)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const payload = {
      product_id,
      category,
      images,
      meta: meta || { allow_wear: true }
    };

    const result = await runPythonAnalysis(payload);
    res.status(200).json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};