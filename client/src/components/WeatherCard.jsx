import { Droplets, Wind, MapPin, Heart } from 'lucide-react';
import WeatherIcon from './WeatherIcon';

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

export default function WeatherCard({ weather, onAddFavorite, isFavorite, favoriteLoading }) {
  if (!weather) return null;

  const {
    city,
    country,
    region,
    temperature,
    feelsLike,
    humidity,
    windSpeed,
    description,
    main,
  } = weather;

  return (
    <div className="rounded-3xl bg-white/15 p-6 shadow-xl backdrop-blur-md ring-1 ring-white/25 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-white/80">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium tracking-wide">
              {city}
              {region ? `, ${region}` : ''}
              {country ? ` · ${country}` : ''}
            </span>
          </div>
          <h1 className="mt-2 text-6xl font-bold tracking-tight text-white md:text-7xl">
            {temperature}°
          </h1>
          <p className="mt-1 text-lg text-white/90">{capitalize(description)}</p>
          <p className="text-sm text-white/70">Feels like {feelsLike}°</p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <WeatherIcon condition={main} className="h-24 w-24 md:h-28 md:w-28" />
          <button
            type="button"
            onClick={onAddFavorite}
            disabled={isFavorite || favoriteLoading}
            className="flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-60"
            title={isFavorite ? 'Already in favorites' : 'Add to favorites'}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-400 text-red-400' : ''}`} />
            {isFavorite ? 'Saved' : 'Save city'}
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat icon={Wind} label="Wind" value={`${windSpeed} m/s`} />
        <Stat icon={Droplets} label="Humidity" value={`${humidity}%`} />
        <div className="col-span-2 rounded-2xl bg-white/10 px-4 py-3 sm:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wider text-white/60">Condition</p>
          <p className="mt-1 text-lg font-semibold text-white">{main}</p>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
      <Icon className="h-5 w-5 text-white/70" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-white/60">{label}</p>
        <p className="text-lg font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}
