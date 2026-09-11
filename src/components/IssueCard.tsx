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
  const priorityClasses = {
    critical:
      "bg-red-500/10 text-red-400 border-red-500/20",

    high:
      "bg-orange-500/10 text-orange-400 border-orange-500/20",

    medium:
      "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",

    low:
      "bg-zinc-900 text-zinc-400 border-zinc-800",
  };

  const statusClasses = {
    open:
      "bg-blue-500/10 text-blue-400 border-blue-500/20",

    investigating:
      "bg-purple-500/10 text-purple-400 border-purple-500/20",

    resolved:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  const priorityClass =
    priorityClasses[
      issue.priority as keyof typeof priorityClasses
    ] ||
    "bg-zinc-900 text-zinc-400 border-zinc-800";

  const statusClass =
    statusClasses[
      issue.status as keyof typeof statusClasses
    ] ||
    "bg-zinc-900 text-zinc-400 border-zinc-800";

  const date = new Date(
    issue.createdAt
  ).toLocaleDateString();

  return (
    <article className="group h-full border border-zinc-800 bg-zinc-950 rounded-2xl p-6 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all duration-200">

      {/* Top */}

      <div className="flex items-start justify-between gap-4 mb-5">

        <div className="flex flex-wrap gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${priorityClass}`}
          >
            {issue.priority}
          </span>

          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusClass}`}
          >
            {issue.status}
          </span>

          {issue.category && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium border border-zinc-800 bg-zinc-900 text-zinc-500">
              {issue.category}
            </span>
          )}
        </div>

        <span className="text-xs text-zinc-600 whitespace-nowrap">
          {date}
        </span>
      </div>

      {/* Title */}

      <h2 className="text-lg font-semibold text-zinc-100 group-hover:text-white transition-colors mb-3">
        {issue.title}
      </h2>

      {/* Description */}

      <p className="text-sm text-zinc-500 leading-6 line-clamp-3">
        {issue.description}
      </p>

      {/* Footer */}

      <div className="flex items-center justify-between mt-6 pt-5 border-t border-zinc-800">
        <span className="text-xs text-zinc-600">
          Issue ID: {issue._id.slice(-8)}
        </span>

        <span className="text-sm text-zinc-500 group-hover:text-blue-400 transition">
          Investigate →
        </span>
      </div>
    </article>
  );
}