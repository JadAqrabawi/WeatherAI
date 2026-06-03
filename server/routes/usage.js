import express from 'express';
import { getUsage } from '../services/weatherAiClient.js';

const router = express.Router();

/** Proxy WeatherAI GET /v1/usage — monthly quota & AI request counts */
router.get('/', async (_req, res) => {
  try {
    const { data, rateLimit } = await getUsage();
    return res.json({ usage: data, rateLimit });
  } catch (err) {
    const status = err.statusCode ?? 500;
    return res.status(status).json({ error: err.message });
  }
});

export default router;
