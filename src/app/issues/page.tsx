"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import IssueCard from "../../components/IssueCard";
import { AlertCircle, RefreshCw } from "lucide-react";

type Issue = {
  _id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
};

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/issues"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch issues");
      }

      const data = await response.json();

      setIssues(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />

      <main className="flex-1 px-8 py-10 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm text-zinc-500">
                Workspace
              </p>

              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
                Issues
              </h1>

              <p className="mt-3 text-sm text-zinc-400">
                Track and investigate reported software problems.
              </p>
            </div>

            <button
              onClick={fetchIssues}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-900 hover:text-white disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />

              Refresh
            </button>
          </div>

          {error && (
            <div className="mt-8 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-12 flex justify-center">
              <RefreshCw
                size={24}
                className="animate-spin text-zinc-500"
              />
            </div>
          ) : issues.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-dashed border-zinc-800 py-20 text-center">
              <h2 className="text-lg font-medium text-white">
                No issues yet
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Create your first issue to start investigating.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {issues.map((issue) => (
                <IssueCard
                  key={issue._id}
                  title={issue.title}
                  description={issue.description}
                  priority={issue.priority}
                  status={issue.status}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}