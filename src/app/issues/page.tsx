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

interface IssuesResponse {
  success?: boolean;
  issues?: Issue[];
  data?: Issue[];
  results?: Issue[];
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [priorityFilter, setPriorityFilter] =
    useState("all");

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/issues"
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch issues (${response.status})`
        );
      }

      const data: unknown = await response.json();

      /*
       * IMPORTANT:
       *
       * The backend may return:
       *
       * 1. [issue, issue, issue]
       *
       * OR
       *
       * 2. { success: true, issues: [...] }
       *
       * OR
       *
       * 3. { success: true, data: [...] }
       *
       * OR
       *
       * 4. { results: [...] }
       *
       * We ALWAYS convert the response into an array
       * before putting it into React state.
       */

      let issuesArray: Issue[] = [];

      if (Array.isArray(data)) {
        issuesArray = data as Issue[];
      } else if (
        data &&
        typeof data === "object"
      ) {
        const responseData =
          data as IssuesResponse;

        if (
          Array.isArray(responseData.issues)
        ) {
          issuesArray = responseData.issues;
        } else if (
          Array.isArray(responseData.data)
        ) {
          issuesArray = responseData.data;
        } else if (
          Array.isArray(responseData.results)
        ) {
          issuesArray = responseData.results;
        }
      }

      setIssues(issuesArray);
    } catch (error) {
      console.error(
        "FETCH ISSUES ERROR:",
        error
      );

      setIssues([]);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load issues."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const filteredIssues = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    /*
     * Extra safety:
     * issues is guaranteed to be an array by fetchIssues,
     * but we still protect the UI from malformed state.
     */

    const safeIssues = Array.isArray(issues)
      ? issues
      : [];

    return safeIssues.filter((issue) => {
      const title =
        typeof issue.title === "string"
          ? issue.title.toLowerCase()
          : "";

      const description =
        typeof issue.description === "string"
          ? issue.description.toLowerCase()
          : "";

      const category =
        typeof issue.category === "string"
          ? issue.category.toLowerCase()
          : "";

      const matchesSearch =
        normalizedSearch === "" ||
        title.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        category.includes(normalizedSearch);

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

  const stats = useMemo(() => {
    const safeIssues = Array.isArray(issues)
      ? issues
      : [];

    return {
      total: safeIssues.length,

      open: safeIssues.filter(
        (issue) =>
          issue.status === "open"
      ).length,

      investigating: safeIssues.filter(
        (issue) =>
          issue.status === "investigating"
      ).length,

      resolved: safeIssues.filter(
        (issue) =>
          issue.status === "resolved"
      ).length,

      critical: safeIssues.filter(
        (issue) =>
          issue.priority === "critical"
      ).length,
    };
  }, [issues]);

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

          <div>

            <div className="mb-3 flex items-center gap-2">

              <span className="text-xs font-medium uppercase tracking-[0.18em] text-blue-400">
                Issue Management
              </span>

              <span className="h-1 w-1 rounded-full bg-zinc-700" />

              <span className="text-xs text-zinc-600">
                {stats.total} total
              </span>

            </div>

            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Issues
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
              Investigate software failures, track
              developer findings and resolve issues
              with AI-assisted workflows.
            </p>

          </div>

          <Link
            href="/new-issue"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-black/10 transition hover:bg-zinc-200"
          >
            <span className="text-base">
              +
            </span>

            Report issue
          </Link>

        </div>

        {/* METRICS */}

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950 px-4 py-4">

            <p className="text-[10px] uppercase tracking-wider text-zinc-600">
              Total
            </p>

            <p className="mt-2 text-xl font-semibold">
              {loading ? "—" : stats.total}
            </p>

          </div>

          <div className="rounded-xl border border-blue-500/10 bg-blue-500/2.5 px-4 py-4">

            <p className="text-[10px] uppercase tracking-wider text-zinc-600">
              Open
            </p>

            <p className="mt-2 text-xl font-semibold text-blue-400">
              {loading ? "—" : stats.open}
            </p>

          </div>

          <div className="rounded-xl border border-purple-500/10 bg-purple-500/2.5 px-4 py-4">

            <p className="text-[10px] uppercase tracking-wider text-zinc-600">
              Investigating
            </p>

            <p className="mt-2 text-xl font-semibold text-purple-400">
              {loading
                ? "—"
                : stats.investigating}
            </p>

          </div>

          <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/2.5 px-4 py-4">

            <p className="text-[10px] uppercase tracking-wider text-zinc-600">
              Resolved
            </p>

            <p className="mt-2 text-xl font-semibold text-emerald-400">
              {loading
                ? "—"
                : stats.resolved}
            </p>

          </div>

          <div className="rounded-xl border border-red-500/10 bg-red-500/2.5 px-4 py-4">

            <p className="text-[10px] uppercase tracking-wider text-zinc-600">
              Critical
            </p>

            <p className="mt-2 text-xl font-semibold text-red-400">
              {loading
                ? "—"
                : stats.critical}
            </p>

          </div>

        </div>

        {/* FILTER BAR */}

        <section className="mb-7 rounded-2xl border border-zinc-800/80 bg-zinc-950 p-3">

          <div className="flex flex-col gap-3 lg:flex-row">

            {/* SEARCH */}

            <div className="relative flex-1">

              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-600">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search by title, description or category..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 py-3 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none transition focus:border-blue-500/40 focus:bg-zinc-900"
              />

            </div>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-400 outline-none transition focus:border-blue-500/40"
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

            {/* PRIORITY */}

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-400 outline-none transition focus:border-blue-500/40"
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

        </section>

        {/* RESULTS HEADER */}

        {!loading && !error && (
          <div className="mb-5 flex items-center justify-between">

            <div>

              <p className="text-sm text-zinc-500">
                Showing{" "}
                <span className="font-medium text-zinc-300">
                  {filteredIssues.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-zinc-300">
                  {Array.isArray(issues)
                    ? issues.length
                    : 0}
                </span>{" "}
                issues
              </p>

            </div>

            <button
              onClick={fetchIssues}
              className="rounded-lg px-3 py-2 text-xs text-zinc-500 transition hover:bg-zinc-900 hover:text-white"
            >
              ↻ Refresh
            </button>

          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-64 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-950"
                />
              )
            )}

          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/2.5 p-10 text-center">

            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              !
            </div>

            <h2 className="font-medium text-zinc-200">
              Unable to load issues
            </h2>

            <p className="mt-2 text-sm text-zinc-600">
              {error}
            </p>

            <button
              onClick={fetchIssues}
              className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-zinc-200"
            >
              Try again
            </button>

          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          filteredIssues.length === 0 && (

            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/50 p-16 text-center">

              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-xl text-zinc-600">
                ◇
              </div>

              <h2 className="text-lg font-semibold text-zinc-200">
                No matching issues
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-600">
                No issues match your current search
                and filters. Try changing the filters
                or report a new issue.
              </p>

              <Link
                href="/new-issue"
                className="mt-6 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-zinc-200"
              >
                Report an issue
              </Link>

            </div>
          )}

        {/* ISSUE GRID */}

        {!loading &&
          !error &&
          filteredIssues.length > 0 && (

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

              {filteredIssues.map(
                (issue) => (
                  <Link
                    key={issue._id}
                    href={`/issues/${issue._id}`}
                    className="block"
                  >
                    <IssueCard
                      issue={issue}
                    />
                  </Link>
                )
              )}

            </div>
          )}

      </div>
    </main>
  );
}