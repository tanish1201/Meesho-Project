import type { NextApiRequest, NextApiResponse } from 'next';
import { getHistoryDetailFromDb } from '../../../src/server/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { runId } = req.query;
    
    if (!runId || typeof runId !== 'string') {
      return res.status(400).json({ error: 'Invalid run ID' });
    }

    const detail = await getHistoryDetailFromDb(runId);
    res.status(200).json(detail);
  } catch (error) {
    console.error('History detail fetch error:', error);
    if (error instanceof Error && error.message === 'Run not found') {
      res.status(404).json({ error: 'Run not found' });
    } else {
      res.status(500).json({ 
        error: 'Failed to fetch history detail',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}