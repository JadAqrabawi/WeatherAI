import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 25000,
});

export async function fetchWeather(city) {
  const { data } = await api.get('/api/weather', { params: { city } });
  return data;
}

export async function fetchWeatherByCoords(lat, lon) {
  const { data } = await api.get('/api/weather', { params: { lat, lon } });
  return data;
}

export async function fetchWeatherGeo() {
  const { data } = await api.get('/api/weather/geo');
  return data;
}

export async function fetchUsage() {
  const { data } = await api.get('/api/usage');
  return data;
}

export async function fetchFavorites() {
  const { data } = await api.get('/api/favorites');
  return data;
}

export async function addFavorite(payload) {
  const { data } = await api.post('/api/favorites', payload);
  return data;
}

export async function removeFavorite(id) {
  const { data } = await api.delete(`/api/favorites/${id}`);
  return data;
}

export async function fetchHistory(limit = 20) {
  const { data } = await api.get('/api/history', { params: { limit } });
  return data;
}

export async function clearHistory() {
  const { data } = await api.delete('/api/history');
  return data;
}

export function getErrorMessage(err) {
  if (axios.isAxiosError(err) && err.response?.data?.error) {
    return err.response.data.error;
  }
  if (axios.isAxiosError(err) && err.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}
