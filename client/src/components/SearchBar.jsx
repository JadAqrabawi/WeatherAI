import { MapPin, Search } from 'lucide-react';

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  onDetectLocation,
  loading,
  geoLoading,
  placeholder = 'Search city (e.g. Nairobi, London)',
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="w-full max-w-xl space-y-2">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2 rounded-2xl bg-white/15 p-1.5 shadow-lg backdrop-blur-md ring-1 ring-white/20">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60"
              aria-hidden
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-xl bg-white/10 py-3 pl-10 pr-4 text-white placeholder-white/50 outline-none transition focus:bg-white/20 focus:ring-2 focus:ring-white/40"
              aria-label="City name"
              disabled={loading || geoLoading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || geoLoading || !value.trim()}
            className="rounded-xl bg-white px-5 py-3 font-semibold text-slate-800 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Search'}
          </button>
        </div>
      </form>

      <button
        type="button"
        onClick={onDetectLocation}
        disabled={loading || geoLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-sm font-medium text-white/90 ring-1 ring-white/20 transition hover:bg-white/20 disabled:opacity-50"
      >
        <MapPin className="h-4 w-4" />
        {geoLoading ? 'Detecting your location…' : 'Use my location (WeatherAI Geo)'}
      </button>
    </div>
  );
}
