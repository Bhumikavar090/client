"use client";

interface Finding {
  title: string;
  type:
    | "OBSERVATION"
    | "API_RESPONSE"
    | "LOG"
    | "CODE_REFERENCE"
    | "DATABASE"
    | "NOTE";
  description: string;
  evidence: string;
  createdAt: string;
}

interface FindingCardProps {
  finding: Finding;
}

const typeLabels: Record<Finding["type"], string> = {
  OBSERVATION: "Observation",
  API_RESPONSE: "API Response",
  LOG: "Log",
  CODE_REFERENCE: "Code Reference",
  DATABASE: "Database",
  NOTE: "Note",
};

export default function FindingCard({
  finding,
}: FindingCardProps) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">
            {finding.title}
          </h3>

          <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-700">
            {typeLabels[finding.type] || "Finding"}
          </p>
        </div>

        <time className="text-[10px] text-zinc-700">
          {new Date(finding.createdAt).toLocaleString()}
        </time>
      </div>

      {finding.description && (
        <p className="mt-4 text-sm leading-6 text-zinc-400">
          {finding.description}
        </p>
      )}

      {finding.evidence && (
        <pre className="mt-4 max-h-60 overflow-auto whitespace-pre-wrap wrap-break-words rounded-lg bg-black/40 p-4 font-mono text-[11px] leading-6 text-zinc-500">
          {finding.evidence}
        </pre>
      )}
    </article>
  );
}