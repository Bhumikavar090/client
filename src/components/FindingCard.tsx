"use client";

interface Finding {
  id: string;
  type: string;
  title: string;
  description: string;
  evidence?: string;
  createdAt: string;
}

interface FindingCardProps {
  finding: Finding;
  onDelete?: (id: string) => void;
}

const typeConfig: Record<
  string,
  { label: string; icon: string }
> = {
  OBSERVATION: {
    label: "Observation",
    icon: "◉",
  },
  API_RESPONSE: {
    label: "API Response",
    icon: "↗",
  },
  LOG: {
    label: "Log",
    icon: "≡",
  },
  CODE_REFERENCE: {
    label: "Code Reference",
    icon: "</>",
  },
  DATABASE: {
    label: "Database",
    icon: "▣",
  },
  NOTE: {
    label: "Developer Note",
    icon: "✦",
  },
};

export default function FindingCard({
  finding,
  onDelete,
}: FindingCardProps) {
  const config =
    typeConfig[finding.type] || typeConfig.NOTE;

  return (
    <article className="group rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 transition hover:border-zinc-700">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-sm text-blue-400">
            {config.icon}
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-400">
              {config.label}
            </span>

            <h3 className="mt-1 text-sm font-semibold text-white">
              {finding.title}
            </h3>
          </div>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(finding.id)}
            className="opacity-0 text-xs text-zinc-600 transition group-hover:opacity-100 hover:text-red-400"
          >
            Delete
          </button>
        )}
      </div>

      <p className="mt-4 text-sm leading-6 text-zinc-400">
        {finding.description}
      </p>

      {finding.evidence && (
        <pre className="mt-4 overflow-x-auto rounded-xl border border-zinc-800 bg-black p-4 text-xs leading-5 text-zinc-400">
          {finding.evidence}
        </pre>
      )}

      <div className="mt-4 text-[10px] uppercase tracking-wider text-zinc-700">
        {new Date(finding.createdAt).toLocaleString()}
      </div>
    </article>
  );
}