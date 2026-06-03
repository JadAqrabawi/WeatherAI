import express from 'express';
import SearchHistory from '../models/SearchHistory.js';
import { geocodeCity } from '../services/geocode.js';
import { getWeather, getWeatherGeo } from '../services/weatherAiClient.js';
import { normalizeWeatherResponse } from '../utils/normalizeWeather.js';

const router = express.Router();

async function resolveCoordinates(req) {
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);
  const city = req.query.city?.trim();

  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    return { lat, lon, geo: { cityName: city } };
  }

  if (!city) {
    return { error: 'Provide ?city=Name or ?lat=&lon= coordinates.' };
  }

  const geo = await geocodeCity(city);
  if (!geo) {
    return { error: `City "${city}" was not found. Check the spelling and try again.`, status: 404 };
  }

  return { lat: geo.lat, lon: geo.lon, geo };
}

router.get('/', async (req, res) => {
  const resolved = await resolveCoordinates(req);
  if (resolved.error) {
    return res.status(resolved.status ?? 400).json({ error: resolved.error });
  }

  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 5, 1), 7);
  const ai = req.query.ai === 'true' ? true : req.query.ai === 'false' ? false : undefined;

  try {
    const { data, rateLimit, geoHeaders } = await getWeather({
      lat: resolved.lat,
      lon: resolved.lon,
      days,
      ai,
    });

    const payload = normalizeWeatherResponse(data, {
      geoHeaders,
      geo: resolved.geo,
    });

    SearchHistory.create({
      cityName: payload.current.city,
      country: payload.current.country,
      region: payload.current.region,
      lat: payload.current.lat,
      lon: payload.current.lon,
      searchedAt: new Date(),
    }).catch((err) => console.error('Failed to save search history:', err.message));

    return res.json({
      ...payload,
      rateLimit,
    });
  } catch (err) {
    const status = err.statusCode ?? 500;
    return res.status(status).json({
      error: err.message,
      rateLimit: err.rateLimit ?? undefined,
    });
  }
});

/** Detect location from caller IP and load weather via WeatherAI /v1/weather-geo */
router.get('/geo', async (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 5, 1), 7);

  try {
    const { data, rateLimit, geoHeaders } = await getWeatherGeo({
      ip: 'auto',
      days,
    });

    const payload = normalizeWeatherResponse(data, { geoHeaders });

    SearchHistory.create({
      cityName: payload.current.city,
      country: payload.current.country,
      region: payload.current.region,
      lat: payload.current.lat,
      lon: payload.current.lon,
      searchedAt: new Date(),
    }).catch((err) => console.error('Failed to save search history:', err.message));

    return res.json({
      ...payload,
      rateLimit,
    });
  } catch (err) {
    const status = err.statusCode ?? 500;
    return res.status(status).json({
      error: err.message,
      rateLimit: err.rateLimit ?? undefined,
    });
  }
});

export default router;
