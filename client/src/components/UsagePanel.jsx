import { Gauge, Zap } from 'lucide-react';

function pickUsageFields(usage) {
  if (!usage || typeof usage !== 'object') return null;

  const requestsUsed =
    usage.requests_used ?? usage.requestsUsed ?? usage.api_calls ?? usage.used;
  const requestsLimit =
    usage.requests_limit ?? usage.requestsLimit ?? usage.limit ?? usage.monthly_limit;
  const aiUsed = usage.ai_requests_used ?? usage.aiRequestsUsed ?? usage.ai_used;
  const aiLimit = usage.ai_requests_limit ?? usage.aiRequestsLimit ?? usage.ai_limit;
  const plan = usage.plan ?? usage.tier ?? '—';
  const periodEnd = usage.period_end ?? usage.periodEnd ?? usage.billing_period_end;

  return { requestsUsed, requestsLimit, aiUsed, aiLimit, plan, periodEnd };
}

export default function UsagePanel({ usage, rateLimit, loading, error }) {
  const fields = pickUsageFields(usage?.usage ?? usage);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white/10 px-4 py-3 text-xs text-white/60">
        Loading API quota…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-white/10 px-4 py-3 text-xs text-white/50">
        Quota info unavailable
      </div>
    );
  }

  const reqPct =
    fields?.requestsUsed != null && fields?.requestsLimit
      ? Math.min(100, Math.round((fields.requestsUsed / fields.requestsLimit) * 100))
      : null;

  return (
    <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/70">
        <Gauge className="h-3.5 w-3.5" />
        WeatherAI quota
        {fields?.plan && (
          <span className="rounded bg-white/15 px-1.5 py-0.5 normal-case text-white/80">
            {fields.plan}
          </span>
        )}
      </div>

      {fields?.requestsUsed != null && fields?.requestsLimit != null ? (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-white/80">
            <span>API requests</span>
            <span>
              {fields.requestsUsed.toLocaleString()} / {fields.requestsLimit.toLocaleString()}
            </span>
          </div>
          {reqPct != null && (
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-all ${
                  reqPct > 90 ? 'bg-red-400' : reqPct > 70 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${reqPct}%` }}
              />
            </div>
          )}
        </div>
      ) : null}

      {fields?.aiUsed != null && fields?.aiLimit != null ? (
        <p className="mt-2 flex items-center gap-1 text-xs text-white/70">
          <Zap className="h-3 w-3" />
          AI: {fields.aiUsed} / {fields.aiLimit}
        </p>
      ) : null}

      {rateLimit?.remaining != null && (
        <p className="mt-1 text-xs text-white/50">
          Remaining this period: {rateLimit.remaining}
          {rateLimit.limit ? ` of ${rateLimit.limit}` : ''}
        </p>
      )}
    </div>
  );
}
