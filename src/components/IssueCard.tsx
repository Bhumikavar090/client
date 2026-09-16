interface IssueCardProps {
  issue: {
    _id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    category?: string;
    createdAt: string;
  };
}

export default function IssueCard({
  issue,
}: IssueCardProps) {
  const priorityConfig = {
    critical: {
      label: "Critical",
      className:
        "border-red-500/20 bg-red-500/[0.06] text-red-400",
      dot: "bg-red-400",
    },

    high: {
      label: "High",
      className:
        "border-orange-500/20 bg-orange-500/[0.06] text-orange-400",
      dot: "bg-orange-400",
    },

    medium: {
      label: "Medium",
      className:
        "border-yellow-500/20 bg-yellow-500/[0.06] text-yellow-400",
      dot: "bg-yellow-400",
    },

    low: {
      label: "Low",
      className:
        "border-zinc-700 bg-zinc-900 text-zinc-400",
      dot: "bg-zinc-500",
    },
  };

  const statusConfig = {
    open: {
      label: "Open",
      className:
        "border-blue-500/20 bg-blue-500/[0.06] text-blue-400",
    },

    investigating: {
      label: "Investigating",
      className:
        "border-purple-500/20 bg-purple-500/[0.06] text-purple-400",
    },

    resolved: {
      label: "Resolved",
      className:
        "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400",
    },
  };

  const priorityData =
    priorityConfig[
      issue.priority as keyof typeof priorityConfig
    ] || priorityConfig.low;

  const statusData =
    statusConfig[
      issue.status as keyof typeof statusConfig
    ] || statusConfig.open;

  const formattedDate = new Date(
    issue.createdAt
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="group relative h-full overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#0d0d10] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-[#101014] hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)]">

      {/* TOP ACCENT */}

      <div
        className={`absolute left-0 top-0 h-px w-0 transition-all duration-300 group-hover:w-full ${
          issue.priority === "critical"
            ? "bg-red-400"
            : issue.priority === "high"
            ? "bg-orange-400"
            : "bg-blue-400"
        }`}
      />


      {/* HEADER */}

      <div className="mb-5 flex items-start justify-between gap-4">

        <div className="flex flex-wrap gap-2">

          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${priorityData.className}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${priorityData.dot}`}
            />

            {priorityData.label}
          </span>

          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${statusData.className}`}
          >
            {statusData.label}
          </span>

        </div>

        <span className="whitespace-nowrap text-[11px] text-zinc-600">
          {formattedDate}
        </span>

      </div>


      {/* TITLE */}

      <h2 className="mb-3 line-clamp-2 text-[17px] font-semibold leading-7 tracking-tight text-zinc-100 transition-colors group-hover:text-white">
        {issue.title}
      </h2>


      {/* DESCRIPTION */}

      <p className="line-clamp-3 text-sm leading-6 text-zinc-500">
        {issue.description}
      </p>


      {/* CATEGORY */}

      <div className="mt-5 min-h-6">

        {issue.category ? (
          <span className="inline-flex items-center gap-2 text-[11px] text-zinc-500">

            <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />

            {issue.category}

          </span>
        ) : (
          <span className="text-[11px] text-zinc-700">
            Uncategorized
          </span>
        )}

      </div>


      {/* FOOTER */}

      <div className="mt-6 flex items-center justify-between border-t border-zinc-800/80 pt-5">

        <div className="flex items-center gap-2">

          <span className="font-mono text-[10px] text-zinc-700">
            #{issue._id.slice(-8)}
          </span>

        </div>

        <span className="flex items-center gap-2 text-xs font-medium text-zinc-600 transition-all group-hover:gap-3 group-hover:text-blue-400">
          Investigate
          <span>→</span>
        </span>

      </div>

    </article>
  );
}