import { useCallback, useEffect, useState } from 'react';
import { CloudSun } from 'lucide-react';

import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import ForecastSection from './components/ForecastSection';
import FavoritesSidebar from './components/FavoritesSidebar';
import AISummaryCard from './components/AISummaryCard';
import UsagePanel from './components/UsagePanel';
import {
  fetchWeather,
  fetchWeatherByCoords,
  fetchWeatherGeo,
  fetchUsage,
  fetchFavorites,
  addFavorite,
  removeFavorite,
  fetchHistory,
  clearHistory,
  getErrorMessage,
} from './api/weatherApi';
import { getBackgroundTheme } from './utils/theme';

export default function App() {
  const [query, setQuery] = useState('');
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);
  const [rateLimit, setRateLimit] = useState(null);
  const [usage, setUsage] = useState(null);
  const [usageError, setUsageError] = useState(false);
  const [usageLoading, setUsageLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  const loadUsage = useCallback(async () => {
    setUsageLoading(true);
    try {
      const data = await fetchUsage();
      setUsage(data);
      setUsageError(false);
    } catch {
      setUsageError(true);
    } finally {
      setUsageLoading(false);
    }
  }, []);

  const loadSidebarData = useCallback(async () => {
    try {
      const [favs, hist] = await Promise.all([fetchFavorites(), fetchHistory()]);
      setFavorites(favs);
      setHistory(hist);
    } catch (err) {
      console.error('Sidebar load failed:', getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    loadSidebarData();
    loadUsage();
  }, [loadSidebarData, loadUsage]);

  const applyWeatherPayload = useCallback((data) => {
    setCurrent(data.current);
    setForecast(data.forecast);
    setAiSummary(data.aiSummary ?? data.current?.aiSummary ?? null);
    setRateLimit(data.rateLimit ?? null);
    setQuery(data.current.city);
  }, []);

  const loadWeather = useCallback(
    async (city) => {
      const trimmed = city?.trim();
      if (!trimmed) return;

      setLoading(true);
      setError(null);

      try {
        const data = await fetchWeather(trimmed);
        applyWeatherPayload(data);
        await loadSidebarData();
        loadUsage();
      } catch (err) {
        setError(getErrorMessage(err));
        if (err.response?.data?.rateLimit) setRateLimit(err.response.data.rateLimit);
        setCurrent(null);
        setForecast([]);
        setAiSummary(null);
      } finally {
        setLoading(false);
      }
    },
    [applyWeatherPayload, loadSidebarData, loadUsage]
  );

  const loadWeatherCoords = useCallback(
    async (lat, lon) => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchWeatherByCoords(lat, lon);
        applyWeatherPayload(data);
        await loadSidebarData();
        loadUsage();
      } catch (err) {
        setError(getErrorMessage(err));
        setCurrent(null);
        setForecast([]);
        setAiSummary(null);
      } finally {
        setLoading(false);
      }
    },
    [applyWeatherPayload, loadSidebarData, loadUsage]
  );

  const handleDetectLocation = async () => {
    setGeoLoading(true);
    setError(null);

    try {
      const data = await fetchWeatherGeo();
      applyWeatherPayload(data);
      await loadSidebarData();
      loadUsage();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGeoLoading(false);
    }
  };

  const handleSearch = () => loadWeather(query);

  const handleAddFavorite = async () => {
    if (current?.lat == null || current?.lon == null) return;
    setFavoriteLoading(true);
    setError(null);
    try {
      await addFavorite({
        cityName: current.city,
        country: current.country,
        region: current.region,
        lat: current.lat,
        lon: current.lon,
      });
      await loadSidebarData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleDeleteFavorite = async (id) => {
    setDeletingId(id);
    try {
      await removeFavorite(id);
      setFavorites((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      setHistory([]);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const isFavorite = current
    ? favorites.some(
        (f) =>
          f.lat === current.lat &&
          f.lon === current.lon
      )
    : false;

  const bgTheme = current
    ? getBackgroundTheme(current.main)
    : 'from-blue-600 via-indigo-700 to-violet-900';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgTheme} transition-all duration-700`}>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:py-10">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <CloudSun className="h-8 w-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">Weather Dashboard</h1>
              <p className="text-sm text-white/70">
                Powered by{' '}
                <a
                  href="https://weather-ai.co/docs"
                  className="underline decoration-white/40 hover:text-white"
                  target="_blank"
                  rel="noreferrer"
                >
                  WeatherAI API
                </a>
              </p>
            </div>
          </div>
          <div className="w-full max-w-xs sm:w-56">
            <UsagePanel
              usage={usage}
              rateLimit={rateLimit ?? usage?.rateLimit}
              loading={usageLoading}
              error={usageError}
            />
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px]">
          <main>
            <SearchBar
              value={query}
              onChange={setQuery}
              onSubmit={handleSearch}
              onDetectLocation={handleDetectLocation}
              loading={loading}
              geoLoading={geoLoading}
            />

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-300/40 bg-red-500/20 px-4 py-3 text-sm text-white"
              >
                {error}
              </div>
            )}

            {loading && !current && (
              <p className="mt-8 text-center text-white/70">Fetching weather from WeatherAI…</p>
            )}

            {!loading && !current && !error && (
              <p className="mt-12 text-center text-lg text-white/60">
                Search for a city or use your location to get started.
              </p>
            )}

            {current && (
              <>
                <div className="mt-6">
                  <WeatherCard
                    weather={current}
                    onAddFavorite={handleAddFavorite}
                    isFavorite={isFavorite}
                    favoriteLoading={favoriteLoading}
                  />
                </div>
                <AISummaryCard summary={aiSummary} />
                <ForecastSection forecast={forecast} />
              </>
            )}
          </main>

          <FavoritesSidebar
            favorites={favorites}
            history={history}
            onSelectFavorite={(city) => loadWeatherCoords(city.lat, city.lon)}
            onSelectHistory={(entry) =>
              entry.lat != null && entry.lon != null
                ? loadWeatherCoords(entry.lat, entry.lon)
                : loadWeather(entry.cityName)
            }
            onDeleteFavorite={handleDeleteFavorite}
            onClearHistory={handleClearHistory}
            deletingId={deletingId}
          />
        </div>
      </div>
    </div>
  );
}
