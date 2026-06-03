import express from 'express';
import SearchHistory from '../models/SearchHistory.js';

const router = express.Router();

const DEFAULT_LIMIT = 20;

router.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 50);

  try {
    const history = await SearchHistory.find()
      .sort({ searchedAt: -1 })
      .limit(limit)
      .lean();
    return res.json(history);
  } catch (err) {
    console.error('GET /api/history:', err.message);
    return res.status(500).json({ error: 'Failed to load search history.' });
  }
});

router.delete('/', async (_req, res) => {
  try {
    await SearchHistory.deleteMany({});
    return res.json({ message: 'Search history cleared.' });
  } catch (err) {
    console.error('DELETE /api/history:', err.message);
    return res.status(500).json({ error: 'Failed to clear search history.' });
  }
});

export default router;
