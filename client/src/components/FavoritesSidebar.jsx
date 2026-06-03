import { Star, Trash2, History, X } from 'lucide-react';

export default function FavoritesSidebar({
  favorites,
  history,
  onSelectFavorite,
  onSelectHistory,
  onDeleteFavorite,
  onClearHistory,
  deletingId,
}) {
  return (
    <aside className="flex h-full flex-col gap-6 rounded-3xl bg-white/10 p-5 shadow-xl backdrop-blur-md ring-1 ring-white/20 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto lg:scrollbar-thin">
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-300" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/80">
            Favorite cities
          </h2>
        </div>
        {favorites.length === 0 ? (
          <p className="text-sm text-white/50">No saved cities yet. Search and tap Save city.</p>
        ) : (
          <ul className="space-y-2">
            {favorites.map((city) => (
              <li
                key={city._id}
                className="group flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 transition hover:bg-white/20"
              >
                <button
                  type="button"
                  onClick={() => onSelectFavorite(city)}
                  className="flex-1 text-left text-sm font-medium text-white"
                >
                  {city.cityName}
                  {city.country ? (
                    <span className="ml-1 text-white/50">({city.country})</span>
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteFavorite(city._id)}
                  disabled={deletingId === city._id}
                  className="rounded-lg p-1.5 text-white/50 transition hover:bg-red-500/30 hover:text-red-200 disabled:opacity-50"
                  aria-label={`Remove ${city.cityName} from favorites`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-t border-white/10 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-sky-200" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/80">
              Search history
            </h2>
          </div>
          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-white/50 transition hover:bg-white/10 hover:text-white"
              title="Clear history"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-white/50">Recent searches will appear here.</p>
        ) : (
          <ul className="space-y-1">
            {history.map((entry) => (
              <li key={entry._id}>
                <button
                  type="button"
                  onClick={() => onSelectHistory(entry)}
                  className="w-full rounded-lg px-2 py-1.5 text-left text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  {entry.cityName}
                  {entry.country ? (
                    <span className="text-white/40"> · {entry.country}</span>
                  ) : null}
                  <span className="mt-0.5 block text-xs text-white/40">
                    {new Date(entry.searchedAt).toLocaleString()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}
