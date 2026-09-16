interface Activity {
  action: string;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

interface ActivityItemProps {
  activity: Activity;
}

export default function ActivityItem({
  activity,
}: ActivityItemProps) {
  const date = activity.createdAt
    ? new Date(activity.createdAt).toLocaleString()
    : "Unknown time";

  return (
    <div className="flex gap-4 rounded-xl border border-white/10 bg-white/2 p-4">
      <div className="mt-1 flex h-3 w-3 shrink-0 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]" />

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-medium text-white">
            {formatAction(activity.action)}
          </h3>

          <span className="text-xs text-gray-500">
            {date}
          </span>
        </div>

        <p className="mt-1 text-sm text-gray-400">
          {activity.message}
        </p>
      </div>
    </div>
  );
}

function formatAction(action: string) {
  return action
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}