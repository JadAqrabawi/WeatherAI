import { Sparkles } from 'lucide-react';

export default function AISummaryCard({ summary }) {
  if (!summary) return null;

  return (
    <section className="mt-4 rounded-2xl border border-violet-300/30 bg-violet-500/15 p-5 backdrop-blur-md">
      <div className="mb-2 flex items-center gap-2 text-violet-100">
        <Sparkles className="h-4 w-4" />
        <h2 className="text-sm font-semibold uppercase tracking-wider">AI weather summary</h2>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
          WeatherAI · Gemini
        </span>
      </div>
      <p className="text-sm leading-relaxed text-white/90">{summary}</p>
    </section>
  );
}
