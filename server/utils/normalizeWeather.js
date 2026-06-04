/**
 * Normalize WeatherAI responses into a stable shape for the React client.
 * Handles multiple possible field names from the upstream JSON payload.
 */

function firstDefined(...values) {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

function toNumber(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function toWindMps(current) {
  const mps = toNumber(current.wind_speed ?? current.wind?.speed ?? current.wind_mps);
  if (mps !== undefined) return mps;

  const kph = toNumber(current.wind_kph ?? current.wind?.kph);
  if (kph !== undefined) return kph / 3.6;

  const ms = toNumber(current.wind_ms);
  if (ms !== undefined) return ms;

  return 0;
}

// Common country name → ISO 3166-1 alpha-2 corrections
// WeatherAI sometimes returns full names or mismatched codes
const COUNTRY_NAME_TO_CODE = {
  'iran': 'IR', 'islamic republic of iran': 'IR',
  'united states': 'US', 'united states of america': 'US',
  'united kingdom': 'GB', 'great britain': 'GB',
  'russia': 'RU', 'russian federation': 'RU',
  'south korea': 'KR', 'republic of korea': 'KR',
  'north korea': 'KP',
  'china': 'CN', "people's republic of china": 'CN',
  'taiwan': 'TW',
  'vietnam': 'VN', 'viet nam': 'VN',
  'turkey': 'TR', 'türkiye': 'TR',
  'czech republic': 'CZ', 'czechia': 'CZ',
  'uae': 'AE', 'united arab emirates': 'AE',
  'saudi arabia': 'SA',
  'south africa': 'ZA',
  'new zealand': 'NZ',
};

function normalizeCountryCode(raw) {
  if (!raw) return '';
  const lower = raw.trim().toLowerCase();
  if (COUNTRY_NAME_TO_CODE[lower]) return COUNTRY_NAME_TO_CODE[lower];
  // If it's already a 2-letter code, uppercase it
  if (/^[a-z]{2}$/i.test(raw.trim())) return raw.trim().toUpperCase();
  return raw.trim();
}

export function inferMainCondition(description = '', code) {
  const text = String(description).toLowerCase();
  if (/thunder|storm/.test(text)) return 'Thunderstorm';
  if (/snow|sleet|blizzard/.test(text)) return 'Snow';
  if (/rain|shower|drizzle/.test(text)) return 'Rain';
  if (/fog|mist|haze/.test(text)) return 'Fog';
  if (/cloud|overcast/.test(text)) return 'Clouds';
  if (/clear|sunny/.test(text)) return 'Clear';
  if (typeof code === 'number') {
    if (code >= 200 && code < 300) return 'Thunderstorm';
    if (code >= 500 && code < 600) return 'Rain';
    if (code >= 600 && code < 700) return 'Snow';
    if (code >= 700 && code < 800) return 'Fog';
    if (code === 800) return 'Clear';
    if (code > 800) return 'Clouds';
  }
  return 'Clouds';
}

// WMO Weather Interpretation Codes (WeatherAI uses these as condition_code)
const WMO_DESCRIPTIONS = {
  0: { text: 'Clear sky', main: 'Clear' },
  1: { text: 'Mainly clear', main: 'Clear' },
  2: { text: 'Partly cloudy', main: 'Clouds' },
  3: { text: 'Overcast', main: 'Clouds' },
  45: { text: 'Fog', main: 'Fog' },
  48: { text: 'Icy fog', main: 'Fog' },
  51: { text: 'Light drizzle', main: 'Rain' },
  53: { text: 'Moderate drizzle', main: 'Rain' },
  55: { text: 'Dense drizzle', main: 'Rain' },
  61: { text: 'Slight rain', main: 'Rain' },
  63: { text: 'Moderate rain', main: 'Rain' },
  65: { text: 'Heavy rain', main: 'Rain' },
  71: { text: 'Slight snow', main: 'Snow' },
  73: { text: 'Moderate snow', main: 'Snow' },
  75: { text: 'Heavy snow', main: 'Snow' },
  77: { text: 'Snow grains', main: 'Snow' },
  80: { text: 'Slight showers', main: 'Rain' },
  81: { text: 'Moderate showers', main: 'Rain' },
  82: { text: 'Heavy showers', main: 'Rain' },
  85: { text: 'Slight snow showers', main: 'Snow' },
  86: { text: 'Heavy snow showers', main: 'Snow' },
  95: { text: 'Thunderstorm', main: 'Thunderstorm' },
  96: { text: 'Thunderstorm with hail', main: 'Thunderstorm' },
  99: { text: 'Thunderstorm with heavy hail', main: 'Thunderstorm' },
};

function resolveWmoCode(code) {
  if (code === undefined || code === null) return null;
  const n = Number(code);
  return WMO_DESCRIPTIONS[n] ?? null;
}

function normalizeDailyDay(day, index) {
  const date =
    day.date ??
    day.datetime?.split('T')[0] ??
    day.dt_txt?.split(' ')[0] ??
    new Date(Date.now() + index * 86400000).toISOString().slice(0, 10);

  const condition = day.condition ?? day.weather?.[0] ?? {};
  const wmo = resolveWmoCode(day.condition_code ?? condition.code);
  const description =
    condition.text ??
    condition.description ??
    day.description ??
    wmo?.text ??
    '—';
  const main = wmo?.main ?? inferMainCondition(description, condition.code);

  const tempMax = Math.round(
    toNumber(day.temp_max ?? day.maxtemp_c ?? day.temp?.max ?? day.temperature?.max) ?? 0
  );
  const tempMin = Math.round(
    toNumber(day.temp_min ?? day.mintemp_c ?? day.temp?.min ?? day.temperature?.min) ?? tempMax
  );

  return {
    date,
    tempMax,
    tempMin,
    humidity: toNumber(day.humidity ?? day.avghumidity) ?? null,
    description,
    main,
    windSpeed: toNumber(day.wind_max ?? day.windspeed_max) ?? toWindMps(day),
    precipChance: toNumber(day.chance_of_rain ?? day.pop ?? day.precipitation_probability),
  };
}

export function normalizeWeatherResponse(raw, { geoHeaders = {}, geo = {} } = {}) {
  // DEBUG — remove after confirming field names
  // console.log('RAW API:', JSON.stringify(raw, null, 2));

  const location = raw.location ?? raw.geo ?? raw.meta?.location ?? {};

  const currentSrc =
    raw.current ?? raw.data?.current ?? (raw.temperature != null ? raw : null) ?? {};

  const dailySrc =
    raw.forecast?.daily ??
    raw.daily ??
    raw.forecast?.days ??
    raw.days ??
    (Array.isArray(raw.forecast) ? raw.forecast : null) ??
    [];

  const city =
    firstDefined(
      location.city,
      location.name,
      geo.city,
      geoHeaders.city,
      geo.cityName
    ) ?? 'Unknown';

  const country = normalizeCountryCode(
    firstDefined(
      geo.country,        // Open-Meteo country_code — most reliable
      geoHeaders.country, // WeatherAI response header
      location.country,   // WeatherAI body (least reliable, can be wrong)
      geo.countryCode
    ) ?? ''
  );

  const region = firstDefined(location.region, geo.region, geoHeaders.region) ?? '';

  const lat = toNumber(
    firstDefined(location.lat, location.latitude, geo.lat, raw.lat)
  );
  const lon = toNumber(
    firstDefined(location.lon, location.longitude, geo.lon, raw.lon)
  );

  const condition = currentSrc.condition ?? currentSrc.weather?.[0] ?? {};
  const currentWmo = resolveWmoCode(currentSrc.condition_code ?? condition.code);
  const description =
    condition.text ??
    condition.description ??
    currentSrc.description ??
    currentSrc.summary ??
    currentWmo?.text ??
    '—';

  const aiSummary = firstDefined(
    raw.ai_summary,
    raw.aiSummary,
    raw.ai?.summary,
    raw.summary,
    currentSrc.ai_summary,
    raw.insights?.summary
  );

  const temperature = Math.round(
    toNumber(
      firstDefined(
        currentSrc.temp_c,
        currentSrc.temperature,
        currentSrc.temp,
        currentSrc.main?.temp
      )
    ) ?? 0
  );

  const feelsLike = Math.round(
    toNumber(
      firstDefined(
        currentSrc.feelslike_c,
        currentSrc.feels_like,
        currentSrc.feelsLike,
        currentSrc.apparent_temperature
      )
    ) ?? temperature
  );

  const current = {
    city,
    country,
    region,
    lat,
    lon,
    temperature,
    feelsLike,
    humidity: toNumber(currentSrc.humidity ?? currentSrc.main?.humidity) ?? 0,
    windSpeed: Number(toWindMps(currentSrc).toFixed(1)),
    description,
    main: currentWmo?.main ?? inferMainCondition(description, condition.code),
    aiSummary: aiSummary ?? null,
    provider: 'weather-ai.co',
  };

  const forecast = (Array.isArray(dailySrc) ? dailySrc : [])
    .slice(0, 5)
    .map(normalizeDailyDay);

  return { current, forecast, aiSummary: aiSummary ?? null };
}