"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import IssueCard from "../../components/IssueCard";

interface Issue {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category?: string;
  createdAt: string;
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

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
    } catch (err) {
      console.error(err);
      setError("Unable to load issues.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const filteredIssues = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return issues.filter((issue) => {
      const matchesSearch =
        normalizedSearch === "" ||
        issue.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        issue.description
          .toLowerCase()
          .includes(normalizedSearch) ||
        issue.category
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        issue.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        issue.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    issues,
    search,
    statusFilter,
    priorityFilter,
  ]);

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <p className="text-sm text-blue-400 mb-2">
              DEVTRAXE AI
            </p>

            <h1 className="text-3xl font-semibold tracking-tight">
              Issues
            </h1>

            <p className="text-zinc-500 mt-2">
              Investigate and manage reported software issues.
            </p>
          </div>

          <Link
            href="/new-issue"
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition"
          >
            + Report issue
          </Link>
        </div>

        {/* Filters */}

        <div className="border border-zinc-800 rounded-2xl bg-zinc-950 p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_180px] gap-3">

            {/* Search */}

            <input
              type="text"
              placeholder="Search issues..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-blue-500 transition"
            />

            {/* Status */}

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300 outline-none focus:border-blue-500 transition"
            >
              <option value="all">
                All statuses
              </option>

              <option value="open">
                Open
              </option>

              <option value="investigating">
                Investigating
              </option>

              <option value="resolved">
                Resolved
              </option>
            </select>

            {/* Priority */}

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value)
              }
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300 outline-none focus:border-blue-500 transition"
            >
              <option value="all">
                All priorities
              </option>

              <option value="critical">
                Critical
              </option>

              <option value="high">
                High
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="low">
                Low
              </option>
            </select>
          </div>
        </div>

        {/* Result count */}

        {!loading && !error && (
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-zinc-500">
              Showing{" "}
              <span className="text-zinc-300">
                {filteredIssues.length}
              </span>{" "}
              of{" "}
              <span className="text-zinc-300">
                {issues.length}
              </span>{" "}
              issues
            </p>

            <button
              onClick={fetchIssues}
              className="text-sm text-zinc-400 hover:text-white transition"
            >
              Refresh
            </button>
          </div>
        )}

        {/* Loading */}

        {loading && (
          <div className="border border-zinc-800 rounded-2xl p-10 text-center">
            <p className="text-zinc-500">
              Loading issues...
            </p>
          </div>
        )}

        {/* Error */}

        {!loading && error && (
          <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-8 text-center">
            <p className="text-red-400 mb-4">
              {error}
            </p>

            <button
              onClick={fetchIssues}
              className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}

        {!loading &&
          !error &&
          filteredIssues.length === 0 && (
            <div className="border border-zinc-800 rounded-2xl p-12 text-center">
              <div className="text-3xl mb-4">
                ◇
              </div>

              <h2 className="text-lg font-medium mb-2">
                No issues found
              </h2>

              <p className="text-sm text-zinc-500">
                Try changing your search or filters.
              </p>
            </div>
          )}

        {/* Issues */}

        {!loading &&
          !error &&
          filteredIssues.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredIssues.map((issue) => (
                <Link
                  key={issue._id}
                  href={`/issues/${issue._id}`}
                  className="block"
                >
                  <IssueCard issue={issue} />
                </Link>
              ))}
            </div>
          )}
      </div>
    </main>
  );
}