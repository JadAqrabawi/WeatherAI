import axios from 'axios';

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

/**
 * Resolve a city name to coordinates (Open-Meteo geocoding — no API key).
 * WeatherAI requires lat/lon; this is used only for location lookup.
 */
export async function geocodeCity(cityName) {
  const { data } = await axios.get(GEOCODE_URL, {
    params: {
      name: cityName,
      count: 1,
      language: 'en',
      format: 'json',
    },
    timeout: 8000,
  });

  const place = data?.results?.[0];
  if (!place) {
    return null;
  }

  return {
    lat: place.latitude,
    lon: place.longitude,
    cityName: place.name,
    country: place.country_code ?? place.country ?? '',
    region: place.admin1 ?? '',
  };
}
