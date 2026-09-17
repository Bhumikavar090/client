"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  data?: Issue[] | { issues?: Issue[]; data?: Issue[] };
  count?: number;
  message?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* =====================================================
   AUTH TOKEN
===================================================== */

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("devtrace_token") ||
    localStorage.getItem("token")
  );
}

/* =====================================================
   NORMALIZE API RESPONSE
   This is the important fix.
===================================================== */

function normalizeIssues(data: unknown): Issue[] {
  // Backend returned an array directly
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const response = data as IssuesResponse;

  // Backend returned:
  // { success: true, issues: [...] }
  if (Array.isArray(response.issues)) {
    return response.issues;
  }

  // Backend returned:
  // { success: true, data: [...] }
  if (Array.isArray(response.data)) {
    return response.data;
  }

  // Backend returned:
  // { data: { issues: [...] } }
  if (
    response.data &&
    typeof response.data === "object" &&
    Array.isArray(response.data.issues)
  ) {
    return response.data.issues;
  }

  // Backend returned:
  // { data: { data: [...] } }
  if (
    response.data &&
    typeof response.data === "object" &&
    Array.isArray(response.data.data)
  ) {
    return response.data.data;
  }

  return [];
}

/* =====================================================
   MAIN PAGE
===================================================== */

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [refreshing, setRefreshing] = useState(false);

  /* ===================================================
     FETCH ISSUES
  =================================================== */

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}/api/issues`,
        {
          method: "GET",
          headers,
          cache: "no-store",
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      console.log(
        "[DevTrace] GET /api/issues response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to load issues (${response.status})`
        );
      }

      /*
       * NEVER put the raw API response into state.
       *
       * Always normalize it into Issue[].
       */
      const normalized = normalizeIssues(data);

      console.log(
        "[DevTrace] Normalized issues:",
        normalized
      );

      setIssues(
        Array.isArray(normalized)
          ? normalized
          : []
      );
    } catch (err) {
      console.error(
        "[DevTrace] ISSUES PAGE ERROR:",
        err
      );

      setIssues([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load issues."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* ===================================================
     INITIAL LOAD
  =================================================== */

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  /* ===================================================
     REFRESH
  =================================================== */

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchIssues();
  };

  /* ===================================================
     SAFETY GUARD
     
     Even if something somehow mutates the state,
     this guarantees all array operations use an array.
  =================================================== */

  const safeIssues: Issue[] = Array.isArray(issues)
    ? issues
    : [];

  /* ===================================================
     FILTERED ISSUES
  =================================================== */

  const filteredIssues = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    const list = Array.isArray(safeIssues)
      ? safeIssues
      : [];

    return list.filter((issue) => {
      const title =
        typeof issue?.title === "string"
          ? issue.title
          : "";

      const description =
        typeof issue?.description === "string"
          ? issue.description
          : "";

      const category =
        typeof issue?.category === "string"
          ? issue.category
          : "";

      const status =
        typeof issue?.status === "string"
          ? issue.status
          : "";

      const priority =
        typeof issue?.priority === "string"
          ? issue.priority
          : "";

      const matchesSearch =
        !query ||
        title.toLowerCase().includes(query) ||
        description
          .toLowerCase()
          .includes(query) ||
        category
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    safeIssues,
    search,
    statusFilter,
    priorityFilter,
  ]);

  /* ===================================================
     STATS
  =================================================== */

  const stats = useMemo(() => {
    const list = Array.isArray(safeIssues)
      ? safeIssues
      : [];

    return {
      total: list.length,

      open: list.filter(
        (issue) =>
          issue.status === "open"
      ).length,

      investigating: list.filter(
        (issue) =>
          issue.status === "investigating"
      ).length,

      resolved: list.filter(
        (issue) =>
          issue.status === "resolved"
      ).length,

      critical: list.filter(
        (issue) =>
          issue.priority === "critical"
      ).length,
    };
  }, [safeIssues]);

  /* ===================================================
     DATE FORMAT
  =================================================== */

  const formatDate = (
    date: string
  ) => {
    const parsed = new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "Unknown date";
    }

    return parsed.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  /* ===================================================
     STATUS STYLES
  =================================================== */

  const getStatusClasses = (
    status: string
  ) => {
    switch (status) {
      case "resolved":
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

      case "investigating":
        return "border-blue-500/20 bg-blue-500/10 text-blue-400";

      case "open":
        return "border-zinc-700 bg-zinc-900 text-zinc-400";

      default:
        return "border-zinc-800 bg-zinc-900 text-zinc-500";
    }
  };

  /* ===================================================
     PRIORITY STYLES
  =================================================== */

  const getPriorityClasses = (
    priority: string
  ) => {
    switch (priority) {
      case "critical":
        return "border-red-500/20 bg-red-500/10 text-red-400";

      case "high":
        return "border-orange-500/20 bg-orange-500/10 text-orange-400";

      case "medium":
        return "border-amber-500/20 bg-amber-500/10 text-amber-400";

      case "low":
        return "border-zinc-800 bg-zinc-900 text-zinc-500";

      default:
        return "border-zinc-800 bg-zinc-900 text-zinc-500";
    }
  };

  /* ===================================================
     STATUS DOT
  =================================================== */

  const getStatusDot = (
    status: string
  ) => {
    switch (status) {
      case "resolved":
        return "bg-emerald-400";

      case "investigating":
        return "bg-blue-400";

      case "open":
        return "bg-zinc-500";

      default:
        return "bg-zinc-600";
    }
  };

  const hasFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    priorityFilter !== "all";

  /* ===================================================
     UI
  =================================================== */

  return (
    <main className="min-h-screen bg-[#08090b] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="absolute left-1/2 top-0 h-125 w-175 -translate-x-1/2 rounded-full bg-blue-500/[0.035] blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mb-10 border-b border-zinc-900 pb-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <Link
                href="/"
                className="mb-5 inline-flex items-center gap-2 text-xs text-zinc-600 transition hover:text-white"
              >
                ← Dashboard
              </Link>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-400 shadow-[0_0_14px_rgba(96,165,250,.5)]" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    DevTrace
                  </p>

                  <p className="text-[9px] uppercase tracking-[0.22em] text-zinc-600">
                    Engineering intelligence
                  </p>
                </div>
              </div>

              <h1 className="mt-7 text-4xl font-semibold tracking-tight text-zinc-100">
                Issues
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                Track, investigate and resolve
                engineering incidents from one
                workspace.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>

              <Link
                href="/new-issue"
                className="rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-zinc-200"
              >
                + New issue
              </Link>
            </div>
          </div>
        </header>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5">
            <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">
              Total
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5">
            <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">
              Open
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {stats.open}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5">
            <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">
              Investigating
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {stats.investigating}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5">
            <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">
              Resolved
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {stats.resolved}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/10 bg-zinc-950 p-5">
            <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">
              Critical
            </p>

            <p className="mt-2 text-2xl font-semibold text-red-400">
              {stats.critical}
            </p>
          </div>
        </section>

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="mb-6 rounded-2xl border border-zinc-800/80 bg-zinc-950 p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search issues..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-blue-500/40"
              />
            </div>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-xs text-zinc-400 outline-none focus:border-blue-500/30"
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
                setPriorityFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-xs text-zinc-400 outline-none focus:border-blue-500/30"
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

            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                }}
                className="rounded-xl border border-zinc-800 px-4 py-3 text-xs text-zinc-500 transition hover:bg-zinc-900 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <section className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                !
              </div>

              <div>
                <p className="text-sm font-medium text-red-400">
                  Failed to load issues
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={fetchIssues}
                  className="mt-3 text-xs text-red-400 underline underline-offset-4 hover:text-red-300"
                >
                  Try again
                </button>
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            ISSUE LIST
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                  Investigation queue
                </p>
              </div>

              <h2 className="mt-2 text-lg font-semibold">
                {loading
                  ? "Loading issues..."
                  : `${filteredIssues.length} ${
                      filteredIssues.length === 1
                        ? "issue"
                        : "issues"
                    }`}
              </h2>
            </div>

            {hasFilters && (
              <span className="text-[10px] text-zinc-600">
                {safeIssues.length} total
              </span>
            )}
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="divide-y divide-zinc-900">
              {[1, 2, 3, 4, 5].map(
                (item) => (
                  <div
                    key={item}
                    className="flex gap-4 px-6 py-6"
                  >
                    <div className="h-11 w-11 animate-pulse rounded-xl bg-zinc-900" />

                    <div className="flex-1">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-900" />

                      <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-zinc-900" />

                      <div className="mt-4 h-5 w-48 animate-pulse rounded bg-zinc-900" />
                    </div>
                  </div>
                )
              )}
            </div>
          ) : filteredIssues.length === 0 ? (
            /* =================================================
               EMPTY
            ================================================= */

            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-600">
                {hasFilters ? "⌕" : "+"}
              </div>

              <h3 className="mt-5 text-sm font-medium text-zinc-300">
                {hasFilters
                  ? "No matching issues"
                  : "No issues yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-zinc-600">
                {hasFilters
                  ? "Try changing your search or filters."
                  : "Create your first engineering issue to start an investigation."}
              </p>

              {!hasFilters && (
                <Link
                  href="/new-issue"
                  className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200"
                >
                  Create issue
                </Link>
              )}
            </div>
          ) : (
            /* =================================================
               ISSUES
            ================================================= */

            <div>
              {filteredIssues.map(
                (issue, index) => (
                  <Link
                    key={issue._id}
                    href={`/issues/${issue._id}`}
                    className={`group block px-6 py-6 transition hover:bg-zinc-900/50 ${
                      index !==
                      filteredIssues.length - 1
                        ? "border-b border-zinc-900"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-500 transition group-hover:border-blue-500/20 group-hover:bg-blue-500/5 group-hover:text-blue-400">
                        <span
                          className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ${getStatusDot(
                            issue.status
                          )}`}
                        />

                        {issue.priority ===
                        "critical"
                          ? "!"
                          : issue.priority ===
                            "high"
                          ? "↑"
                          : "•"}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <h3 className="text-sm font-medium text-zinc-200 transition group-hover:text-white">
                            {issue.title}
                          </h3>

                          <span className="shrink-0 text-[10px] text-zinc-700">
                            {formatDate(
                              issue.createdAt
                            )}
                          </span>
                        </div>

                        <p className="mt-2 line-clamp-2 max-w-3xl text-xs leading-5 text-zinc-600">
                          {issue.description}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-md border px-2 py-1 text-[9px] font-medium uppercase tracking-wider ${getStatusClasses(
                              issue.status
                            )}`}
                          >
                            {issue.status}
                          </span>

                          <span
                            className={`rounded-md border px-2 py-1 text-[9px] font-medium uppercase tracking-wider ${getPriorityClasses(
                              issue.priority
                            )}`}
                          >
                            {issue.priority}
                          </span>

                          {issue.category && (
                            <span className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-[9px] uppercase tracking-wider text-zinc-600">
                              {issue.category}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="mt-4 text-zinc-800 transition group-hover:translate-x-1 group-hover:text-blue-400">
                        →
                      </span>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="flex flex-col gap-2 py-8 text-[10px] text-zinc-700 sm:flex-row sm:items-center sm:justify-between">
          <span>
            DevTrace · Engineering investigation
            platform
          </span>

          <span>
            {stats.total} issues ·{" "}
            {stats.resolved} resolved
          </span>
        </footer>
      </div>
    </main>
  );
}