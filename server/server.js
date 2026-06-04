import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import weatherRoutes from './routes/weather.js';
import favoritesRoutes from './routes/favorites.js';
import historyRoutes from './routes/history.js';
import usageRoutes from './routes/usage.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5002;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const isProduction = process.env.NODE_ENV === 'production';

const corsOrigins = CLIENT_URL.split(',').map((o) => o.trim());

app.use(
  cors({
    origin: isProduction ? corsOrigins : [CLIENT_URL, 'http://localhost:5173'],
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    provider: 'weather-ai.co',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/weather', weatherRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/usage', usageRoutes);

if (isProduction) {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

async function start() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('MONGODB_URI is missing. Copy server/.env.example to server/.env');
    process.exit(1);
  }

  if (!process.env.WEATHER_AI_API_KEY) {
    console.error('WEATHER_AI_API_KEY is missing. Get a key at https://weather-ai.co/docs');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

start();
