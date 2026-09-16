"use client";

import { useEffect, useState } from "react";
import ActivityItem from "./ActivityItem";

interface Activity {
  _id?: string;
  action: string;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

interface ActivityTimelineProps {
  issueId: string;
}

export default function ActivityTimeline({
  issueId,
}: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      try {
        const response = await fetch(
          `http://localhost:5000/api/issues/${issueId}/activity`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch activities");
        }

        const data = await response.json();

        setActivities(data.activities || []);
      } catch (error) {
        console.error("Activity loading failed:", error);
      } finally {
        setLoading(false);
      }
    }

    loadActivities();
  }, [issueId]);

  if (loading) {
    return (
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-4">
          Activity Timeline
        </h2>

        <div className="rounded-xl border border-white/10 p-6 text-gray-400">
          Loading activity...
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">
          Activity Timeline
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          History of actions performed on this issue.
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-xl border border-white/10 p-6 text-gray-500">
          No activity recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <ActivityItem
              key={activity._id || index}
              activity={activity}
            />
          ))}
        </div>
      )}
    </section>
  );
}