const CONDITION_THEMES = {
  Clear: 'from-amber-400 via-sky-400 to-blue-600',
  Clouds: 'from-slate-400 via-slate-500 to-slate-700',
  Rain: 'from-slate-600 via-blue-800 to-slate-900',
  Drizzle: 'from-slate-500 via-blue-700 to-slate-800',
  Thunderstorm: 'from-indigo-900 via-purple-900 to-slate-900',
  Snow: 'from-sky-100 via-sky-200 to-blue-300',
  Mist: 'from-gray-400 via-gray-500 to-gray-600',
  Fog: 'from-gray-400 via-gray-500 to-gray-600',
  Haze: 'from-amber-200 via-orange-300 to-amber-400',
};

const DEFAULT_THEME = 'from-blue-500 via-indigo-600 to-purple-800';

export function getBackgroundTheme(mainCondition) {
  return CONDITION_THEMES[mainCondition] || DEFAULT_THEME;
}

export function formatDayLabel(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, tomorrow)) return 'Tomorrow';
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}
