import axios from 'axios';

const WEATHER_AI_BASE = 'https://api.weather-ai.co';

function authHeaders() {
  const apiKey = process.env.WEATHER_AI_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error('WEATHER_AI_API_KEY is not configured on the server.'), {
      statusCode: 500,
    });
  }
  return { Authorization: `Bearer ${apiKey}` };
}

function extractRateLimit(headers) {
  return {
    limit: headers['x-ratelimit-limit'] ?? null,
    remaining: headers['x-ratelimit-remaining'] ?? null,
    reset: headers['x-ratelimit-reset'] ?? null,
  };
}

function mapAxiosError(err) {
  if (!axios.isAxiosError(err) || !err.response) {
    return { status: 503, message: 'Unable to reach WeatherAI. Try again later.' };
  }

  const { status, data, headers } = err.response;
  const message =
    data?.error?.message ??
    data?.message ??
    data?.error ??
    (typeof data === 'string' ? data : null);

  if (status === 401) {
    return { status: 502, message: 'Invalid WeatherAI API key on the server.' };
  }
  if (status === 429) {
    const reset = headers['x-ratelimit-reset'];
    const resetHint = reset
      ? ` Quota resets at ${new Date(Number(reset) * 1000).toLocaleString()}.`
      : '';
    return {
      status: 429,
      message: `Monthly API quota exceeded.${resetHint}`,
      rateLimit: extractRateLimit(headers),
    };
  }
  if (status === 403) {
    return { status: 403, message: message || 'This feature is not included in your plan.' };
  }
  if (status === 400) {
    return { status: 400, message: message || 'Invalid request to WeatherAI.' };
  }

  return {
    status: status >= 500 ? 503 : status,
    message: message || 'WeatherAI returned an error.',
    rateLimit: extractRateLimit(headers),
  };
}

/**
 * GET /v1/weather — current conditions + multi-day forecast.
 * @see https://weather-ai.co/docs
 */
export async function getWeather({ lat, lon, days = 5, ai }) {
  const useAi = ai ?? process.env.WEATHER_AI_AI !== 'false';

  try {
    const response = await axios.get(`${WEATHER_AI_BASE}/v1/weather`, {
      params: {
        lat,
        lon,
        days,
        ai: useAi,
        units: 'metric',
        lang: 'en',
      },
      headers: authHeaders(),
      timeout: 20000,
    });

    return {
      data: response.data,
      rateLimit: extractRateLimit(response.headers),
      geoHeaders: {
        country: response.headers['x-country'],
        region: response.headers['x-region'],
        city: response.headers['x-city'],
      },
    };
  } catch (err) {
    if (err.statusCode) throw err;
    const mapped = mapAxiosError(err);
    const error = new Error(mapped.message);
    error.statusCode = mapped.status;
    error.rateLimit = mapped.rateLimit;
    throw error;
  }
}

/**
 * GET /v1/weather-geo — weather with optional IP-based geo detection.
 */
export async function getWeatherGeo({ ip = 'auto', lat, lon, days = 5, ai } = {}) {
  const useAi = ai ?? process.env.WEATHER_AI_AI !== 'false';
  const params = { ip, days, ai: useAi, units: 'metric', lang: 'en' };
  if (lat != null && lon != null) {
    params.lat = lat;
    params.lon = lon;
  }

  try {
    const response = await axios.get(`${WEATHER_AI_BASE}/v1/weather-geo`, {
      params,
      headers: authHeaders(),
      timeout: 20000,
    });

    return {
      data: response.data,
      rateLimit: extractRateLimit(response.headers),
      geoHeaders: {
        country: response.headers['x-country'],
        region: response.headers['x-region'],
        city: response.headers['x-city'],
      },
    };
  } catch (err) {
    const mapped = mapAxiosError(err);
    const error = new Error(mapped.message);
    error.statusCode = mapped.status;
    error.rateLimit = mapped.rateLimit;
    throw error;
  }
}

/**
 * GET /v1/usage — billing period usage stats (quota / scaling visibility).
 */
export async function getUsage() {
  try {
    const response = await axios.get(`${WEATHER_AI_BASE}/v1/usage`, {
      headers: authHeaders(),
      timeout: 10000,
    });

    return {
      data: response.data,
      rateLimit: extractRateLimit(response.headers),
    };
  } catch (err) {
    const mapped = mapAxiosError(err);
    const error = new Error(mapped.message);
    error.statusCode = mapped.status;
    throw error;
  }
}
