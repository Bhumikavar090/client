"use client";

interface AIResult {
  rootCause?: string;
  evidenceAssessment?: string;
  nextAction?: string;
  resolutionConfidence?: number;
  sufficientEvidence?: boolean;
}

interface AIResultCardProps {
  result: AIResult | null;
  loading?: boolean;
}

export default function AIResultCard({
  result,
  loading = false,
}: AIResultCardProps) {
  if (loading) {
    return (
      <section className="rounded-2xl border border-blue-500/20 bg-blue-500/3 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            ✦
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              AI Findings Analysis
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              Analyzing developer evidence...
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3 animate-pulse">
          <div className="h-4 rounded bg-zinc-900" />
          <div className="h-4 w-5/6 rounded bg-zinc-900" />
          <div className="h-4 w-4/6 rounded bg-zinc-900" />
        </div>
      </section>
    );
  }

  if (!result) return null;

  const confidence = Math.max(
    0,
    Math.min(100, Number(result.resolutionConfidence) || 0)
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-blue-500/20 bg-blue-500/3">
      <div className="border-b border-blue-500/10 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
            ✦
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              AI Findings Analysis
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              Gemini analysis based on developer evidence
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Likely root cause
          </p>

          <p className="text-sm leading-7 text-zinc-300">
            {result.rootCause || "No root cause determined."}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Evidence assessment
          </p>

          <p className="text-sm leading-7 text-zinc-400">
            {result.evidenceAssessment ||
              "No evidence assessment available."}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Recommended next action
          </p>

          <p className="text-sm leading-7 text-zinc-400">
            {result.nextAction || "No next action available."}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                Resolution confidence
              </p>

              <p className="mt-2 text-3xl font-semibold text-zinc-200">
                {confidence}%
              </p>
            </div>

            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                result.sufficientEvidence
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
              }`}
            >
              {result.sufficientEvidence
                ? "Evidence sufficient"
                : "More evidence needed"}
            </span>
          </div>

          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-zinc-900">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-700"
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}