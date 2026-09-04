type Issue = {
  title: string;
  description: string;
  priority: string;
  status: string;
};

export default function IssueCard({
  title,
  description,
  priority,
  status,
}: Issue) {

  const priorityStyles: Record<string, string> = {
    low: "bg-emerald-500/10 text-emerald-400",
    medium: "bg-yellow-500/10 text-yellow-400",
    high: "bg-orange-500/10 text-orange-400",
    critical: "bg-red-500/10 text-red-400",
  };


  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-zinc-700">

      <div className="flex items-start justify-between gap-4">

        <div>
          <h3 className="font-medium text-white">
            {title}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-400">
            {description}
          </p>
        </div>


        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            priorityStyles[priority] ||
            "bg-zinc-800 text-zinc-400"
          }`}
        >
          {priority}
        </span>

      </div>


      <div className="mt-5 flex items-center gap-2 text-xs text-zinc-500">

        <span className="h-2 w-2 rounded-full bg-blue-400" />

        {status}

      </div>

    </div>
  );
}