import { formatDayLabel } from '../utils/theme';
import WeatherIcon from './WeatherIcon';

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

export default function ForecastSection({ forecast }) {
  if (!forecast?.length) return null;

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/70">
        5-day forecast · WeatherAI
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {forecast.map((day) => (
          <article
            key={day.date}
            className="min-w-[120px] flex-shrink-0 rounded-2xl bg-white/15 px-4 py-4 text-center backdrop-blur-md ring-1 ring-white/20"
          >
            <p className="text-sm font-medium text-white/80">{formatDayLabel(day.date)}</p>
            <div className="mx-auto my-1 flex justify-center">
              <WeatherIcon condition={day.main} className="h-12 w-12" />
            </div>
            <p className="text-xs text-white/70">{capitalize(day.description)}</p>
            <p className="mt-2 text-lg font-bold text-white">
              {day.tempMax}°
              <span className="text-sm font-normal text-white/60"> / {day.tempMin}°</span>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
