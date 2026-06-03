# WeatherAI Dashboard

A full-stack weather dashboard built for the **WeatherAI developer platform** take-home challenge. It consumes the [WeatherAI REST API](https://weather-ai.co/docs) (`https://api.weather-ai.co`), surfaces **AI-generated summaries**, monitors **monthly quota / rate limits**, and persists favorites and search history in MongoDB.

**Live demo:** _Add your Render/Railway URL after deploy_  
**API docs:** https://weather-ai.co/docs

---

## What this demonstrates

| Requirement | Implementation |
|-------------|----------------|
| WeatherAI API integration | `GET /v1/weather`, `GET /v1/weather-geo`, `GET /v1/usage` via secure server proxy |
| API key security | `WEATHER_AI_API_KEY` stays on the server (`Bearer wai_…`) |
| Scaling / quota awareness | Usage panel + `X-RateLimit-*` headers forwarded to the UI |
| AI summaries | Gemini summaries from WeatherAI displayed in the dashboard |
| Clean UX | Search, geo-detect, 5-day forecast, favorites, history |

---

## Architecture

```
┌─────────────┐     /api/*      ┌──────────────────┐     Bearer Auth    ┌─────────────────────┐
│ React +     │ ──────────────► │ Express (Node)   │ ─────────────────► │ api.weather-ai.co   │
│ Tailwind    │                 │ MongoDB          │                    │ /v1/weather         │
│ (Vite)      │                 │                  │                    │ /v1/weather-geo     │
└─────────────┘                 └──────────────────┘                    │ /v1/usage           │
                                      │                                   └─────────────────────┘
                                      │ geocode only (city → lat/lon)
                                      ▼
                               Open-Meteo Geocoding (no key)
```

**Why a backend proxy?** WeatherAI keys must not ship to the browser. The Express layer also normalizes upstream JSON, records search history, and enforces CORS.

---

## Tech stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide icons, Axios
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB (Atlas recommended for production)
- **Weather data:** [WeatherAI API](https://weather-ai.co/docs)
- **City search:** Open-Meteo Geocoding (lat/lon lookup only — WeatherAI requires coordinates)

---

## Project structure

```
weather/
├── client/                 # React frontend
│   └── src/
│       ├── api/weatherApi.js
│       └── components/     # SearchBar, WeatherCard, ForecastSection, etc.
├── server/
│   ├── services/weatherAiClient.js   # WeatherAI HTTP client
│   ├── services/geocode.js           # City → coordinates
│   ├── utils/normalizeWeather.js     # Response normalizer
│   ├── models/                       # UserCity, SearchHistory
│   └── routes/                       # weather, favorites, history, usage
├── render.yaml             # One-click Render deploy
└── README.md
```

---

## Prerequisites

- **Node.js** 18+
- **MongoDB** — local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier)
- **WeatherAI API key** — create at [weather-ai.co](https://weather-ai.co) → Dashboard → API Keys (`wai_…` prefix)

---

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/weather-ai-dashboard.git
cd weather-ai-dashboard
npm run install:all
```

### 2. Server environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/weather_app
WEATHER_AI_API_KEY=wai_your_actual_key
WEATHER_AI_AI=true
PORT=5000
CLIENT_URL=http://localhost:5173
```

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `WEATHER_AI_API_KEY` | From [WeatherAI Dashboard](https://weather-ai.co/docs) |
| `WEATHER_AI_AI` | `true` = include Gemini summaries; `false` saves AI quota |
| `CLIENT_URL` | Frontend origin for CORS |

### 3. Client environment (optional)

```bash
cp client/.env.example client/.env
```

Leave `VITE_API_URL` **empty** for local dev (Vite proxies `/api` → port 5000).

### 4. Run

```bash
# Terminal 1 — ensure MongoDB is running
npm run dev:server

# Terminal 2
npm run dev:client
```

Open **http://localhost:5173**

---

## API routes (this app)

| Method | Route | WeatherAI endpoint |
|--------|-------|-------------------|
| GET | `/api/weather?city=London` | `/v1/weather` (after geocoding) |
| GET | `/api/weather?lat=&lon=` | `/v1/weather` |
| GET | `/api/weather/geo` | `/v1/weather-geo?ip=auto` |
| GET | `/api/usage` | `/v1/usage` |
| GET/POST/DELETE | `/api/favorites` | MongoDB |
| GET/DELETE | `/api/history` | MongoDB |
| GET | `/api/health` | — |

---

## Deploy to Render (recommended)

1. Push this repo to a **public GitHub** repository.
2. Create a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster → copy connection string.
3. In [Render](https://render.com): **New → Blueprint** (or Web Service) and connect the repo.
4. Use `render.yaml` or configure manually:
   - **Build:** `npm run install:all && npm run build:client`
   - **Start:** `NODE_ENV=production npm start --prefix server`
5. Set environment variables:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Atlas connection string |
| `WEATHER_AI_API_KEY` | Your `wai_…` key |
| `WEATHER_AI_AI` | `true` |
| `CLIENT_URL` | `https://YOUR-SERVICE.onrender.com` |
| `NODE_ENV` | `production` |

6. After deploy, update this README’s **Live demo** link and test `/api/health`.

**Note:** Render free tier spins down after inactivity; first load may take ~30s.

### Alternative platforms

- **Railway:** Same build/start commands; add MongoDB plugin or Atlas URI.
- **Fly.io / VPS:** Run `npm run build` then `NODE_ENV=production npm start`.

---

## Email submission template

Reply to the assignment email with:

```
GitHub: https://github.com/YOUR_USERNAME/weather-ai-dashboard
Live demo: https://YOUR-SERVICE.onrender.com

Summary:
- Integrates WeatherAI /v1/weather, /v1/weather-geo, and /v1/usage
- Server-side API key proxy, MongoDB favorites/history
- UI shows AI summaries and monthly quota (rate-limit awareness)
```

---

## License

MIT — built as a technical assessment sample.
