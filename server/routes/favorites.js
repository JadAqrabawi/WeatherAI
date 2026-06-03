import express from 'express';
import UserCity from '../models/UserCity.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const cities = await UserCity.find().sort({ addedAt: -1 }).lean();
    return res.json(cities);
  } catch (err) {
    console.error('GET /api/favorites:', err.message);
    return res.status(500).json({ error: 'Failed to load favorite cities.' });
  }
});

router.post('/', async (req, res) => {
  const cityName = req.body.cityName?.trim();
  const country = req.body.country?.trim() || '';
  const region = req.body.region?.trim() || '';
  const lat = Number(req.body.lat);
  const lon = Number(req.body.lon);

  if (!cityName) {
    return res.status(400).json({ error: 'cityName is required.' });
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return res.status(400).json({ error: 'lat and lon are required.' });
  }

  try {
    const existing = await UserCity.findOne({ lat, lon });
    if (existing) {
      return res.status(409).json({
        error: `"${existing.cityName}" is already in your favorites.`,
        city: existing,
      });
    }

    const city = await UserCity.create({ cityName, country, region, lat, lon });
    return res.status(201).json(city);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'This location is already in your favorites.' });
    }
    console.error('POST /api/favorites:', err.message);
    return res.status(500).json({ error: 'Failed to save favorite city.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await UserCity.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Favorite city not found.' });
    }
    return res.json({ message: 'City removed from favorites.', city: deleted });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid city id.' });
    }
    console.error('DELETE /api/favorites:', err.message);
    return res.status(500).json({ error: 'Failed to delete favorite city.' });
  }
});

export default router;
