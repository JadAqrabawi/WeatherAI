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

function normalizeDailyDay(day, index) {
  const date =
    day.date ??
    day.datetime?.split('T')[0] ??
    day.dt_txt?.split(' ')[0] ??
    new Date(Date.now() + index * 86400000).toISOString().slice(0, 10);

  const condition = day.condition ?? day.weather?.[0] ?? {};
  const description =
    condition.text ?? condition.description ?? day.description ?? '—';

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
    main: inferMainCondition(description, condition.code),
    windSpeed: toWindMps(day),
    precipChance: toNumber(day.chance_of_rain ?? day.pop ?? day.precipitation_probability),
  };
}

export function normalizeWeatherResponse(raw, { geoHeaders = {}, geo = {} } = {}) {
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

  const country = firstDefined(
    location.country,
    geo.country,
    geoHeaders.country,
    geo.countryCode
  ) ?? '';

  const region = firstDefined(location.region, geo.region, geoHeaders.region) ?? '';

  const lat = toNumber(
    firstDefined(location.lat, location.latitude, geo.lat, raw.lat)
  );
  const lon = toNumber(
    firstDefined(location.lon, location.longitude, geo.lon, raw.lon)
  );

  const condition = currentSrc.condition ?? currentSrc.weather?.[0] ?? {};
  const description =
    condition.text ??
    condition.description ??
    currentSrc.description ??
    currentSrc.summary ??
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
      currentSrc.temp_c,
      currentSrc.temperature,
      currentSrc.temp,
      currentSrc.main?.temp
    ) ?? 0
  );

  const feelsLike = Math.round(
    toNumber(
      currentSrc.feelslike_c,
      currentSrc.feels_like,
      currentSrc.feelsLike,
      temperature
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
    main: inferMainCondition(description, condition.code),
    aiSummary: aiSummary ?? null,
    provider: 'weather-ai.co',
  };

  const forecast = (Array.isArray(dailySrc) ? dailySrc : [])
    .slice(0, 5)
    .map(normalizeDailyDay);

  return { current, forecast, aiSummary: aiSummary ?? null };
}
