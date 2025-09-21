import type { NextApiRequest, NextApiResponse } from 'next';
import { getHistoryFromDb } from '../../../src/server/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const history = await getHistoryFromDb();
    res.status(200).json(history);
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch history',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}