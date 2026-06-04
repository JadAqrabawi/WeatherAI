import axios from 'axios';

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

/**
 * Resolve a city name to coordinates (Open-Meteo geocoding — no API key).
 * WeatherAI requires lat/lon; this is used only for location lookup.
 *
 * This function now handles network/timeouts and throws a helpful error
 * with `status` set so callers can return appropriate HTTP responses.
 */
export async function geocodeCity(cityName) {
  try {
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
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const message = err.code === 'ETIMEDOUT' ? 'Geocoding service timed out.' : 'Unable to reach geocoding service.';
      const e = new Error(message);
      e.status = 503;
      throw e;
    }
    throw err;
  }
}
