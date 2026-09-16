"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface Issue {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category?: string;
  createdAt: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  techStack: string[];
  createdAt: string;
}

export default function HomePage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const [
          issuesResponse,
          projectsResponse,
        ] = await Promise.all([
          fetch(
            "http://localhost:5000/api/issues"
          ),
          fetch(
            "http://localhost:5000/api/projects"
          ),
        ]);

        if (
          !issuesResponse.ok ||
          !projectsResponse.ok
        ) {
          throw new Error(
            "Failed to load dashboard"
          );
        }

        const [
          issuesData,
          projectsData,
        ] = await Promise.all([
          issuesResponse.json(),
          projectsResponse.json(),
        ]);

        setIssues(issuesData);
        setProjects(projectsData);
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const stats = useMemo(() => {
    const activeIssues =
      issues.filter(
        (issue) =>
          issue.status !== "resolved"
      ).length;

    const resolvedIssues =
      issues.filter(
        (issue) =>
          issue.status === "resolved"
      ).length;

    const criticalIssues =
      issues.filter(
        (issue) =>
          issue.priority === "critical"
      ).length;

    const resolutionRate =
      issues.length === 0
        ? 0
        : Math.round(
            (resolvedIssues /
              issues.length) *
              100
          );

    return {
      totalIssues: issues.length,
      activeIssues,
      resolvedIssues,
      criticalIssues,
      resolutionRate,
    };
  }, [issues]);

  const recentIssues = issues.slice(0, 5);

  return (
    <main className="min-h-screen bg-[#09090b] text-white">

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* HEADER */}

        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">

          <div>

            <div className="mb-3 flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-emerald-400" />

              <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                System operational
              </span>

            </div>

            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Engineering Overview
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
              Monitor issues, investigate failures and
              use AI-assisted workflows to move from
              report to resolution.
            </p>

          </div>


          <div className="flex gap-3">

            <Link
              href="/projects"
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
            >
              Projects
            </Link>

            <Link
              href="/new-issue"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              + Report issue
            </Link>

          </div>

        </div>


        {/* STATS */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL */}

          <div className="group rounded-2xl border border-zinc-800/80 bg-zinc-950 p-6 transition hover:border-zinc-700">

            <div className="mb-6 flex items-center justify-between">

              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Total Issues
              </span>

              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                ◇
              </span>

            </div>

            <p className="text-3xl font-semibold">
              {loading
                ? "—"
                : stats.totalIssues}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              All reported issues
            </p>

          </div>


          {/* ACTIVE */}

          <div className="group rounded-2xl border border-zinc-800/80 bg-zinc-950 p-6 transition hover:border-zinc-700">

            <div className="mb-6 flex items-center justify-between">

              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Active
              </span>

              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                ◌
              </span>

            </div>

            <p className="text-3xl font-semibold">
              {loading
                ? "—"
                : stats.activeIssues}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Issues requiring attention
            </p>

          </div>


          {/* RESOLUTION */}

          <div className="group rounded-2xl border border-zinc-800/80 bg-zinc-950 p-6 transition hover:border-zinc-700">

            <div className="mb-6 flex items-center justify-between">

              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Resolution Rate
              </span>

              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                ✓
              </span>

            </div>

            <p className="text-3xl font-semibold">
              {loading
                ? "—"
                : `${stats.resolutionRate}%`}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Resolved issues
            </p>

          </div>


          {/* CRITICAL */}

          <div className="group rounded-2xl border border-zinc-800/80 bg-zinc-950 p-6 transition hover:border-zinc-700">

            <div className="mb-6 flex items-center justify-between">

              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Critical
              </span>

              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                !
              </span>

            </div>

            <p className="text-3xl font-semibold">
              {loading
                ? "—"
                : stats.criticalIssues}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              High-risk issues
            </p>

          </div>

        </div>


        {/* MAIN GRID */}

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">


          {/* RECENT ISSUES */}

          <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950">

            <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-5">

              <div>

                <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                  Activity
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  Recent investigations
                </h2>

              </div>

              <Link
                href="/issues"
                className="text-xs text-zinc-500 transition hover:text-white"
              >
                View all →
              </Link>

            </div>


            {error ? (

              <div className="p-10 text-center">

                <p className="text-sm text-red-400">
                  {error}
                </p>

              </div>

            ) : loading ? (

              <div className="p-10 text-center">

                <p className="text-sm text-zinc-600">
                  Loading activity...
                </p>

              </div>

            ) : recentIssues.length === 0 ? (

              <div className="p-12 text-center">

                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-600">
                  ◇
                </div>

                <p className="text-sm font-medium text-zinc-300">
                  No investigations yet
                </p>

                <p className="mt-2 text-xs text-zinc-600">
                  Report your first issue to begin.
                </p>

              </div>

            ) : (

              <div>

                {recentIssues.map(
                  (issue, index) => (

                    <Link
                      key={issue._id}
                      href={`/issues/${issue._id}`}
                      className={`group flex items-center gap-4 px-6 py-5 transition hover:bg-zinc-900/50 ${
                        index !==
                        recentIssues.length - 1
                          ? "border-b border-zinc-800/60"
                          : ""
                      }`}
                    >

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-sm text-zinc-500 group-hover:border-blue-500/20 group-hover:bg-blue-500/10 group-hover:text-blue-400">
                        ◇
                      </div>


                      <div className="min-w-0 flex-1">

                        <div className="flex items-center gap-2">

                          <h3 className="truncate text-sm font-medium text-zinc-200 group-hover:text-white">
                            {issue.title}
                          </h3>

                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">

                          <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-500">
                            {issue.status}
                          </span>

                          <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-500">
                            {issue.priority}
                          </span>

                          {issue.category && (
                            <span className="text-[10px] text-zinc-600">
                              {issue.category}
                            </span>
                          )}

                        </div>

                      </div>


                      <span className="text-zinc-700 transition group-hover:text-blue-400">
                        →
                      </span>

                    </Link>

                  )
                )}

              </div>

            )}

          </section>


          {/* RIGHT COLUMN */}

          <div className="space-y-6">


            {/* PROJECTS */}

            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950">

              <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-5">

                <div>

                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                    Workspace
                  </p>

                  <h2 className="mt-1 text-lg font-semibold">
                    Projects
                  </h2>

                </div>

                <span className="text-xs text-zinc-600">
                  {projects.length}
                </span>

              </div>


              {projects.length === 0 ? (

                <div className="p-7">

                  <p className="text-sm text-zinc-500">
                    No projects created yet.
                  </p>

                  <Link
                    href="/projects"
                    className="mt-4 inline-block text-xs text-blue-400 hover:text-blue-300"
                  >
                    Create a project →
                  </Link>

                </div>

              ) : (

                <div className="p-3">

                  {projects
                    .slice(0, 4)
                    .map((project) => (

                      <Link
                        key={project._id}
                        href="/projects"
                        className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-zinc-900"
                      >

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-xs text-zinc-500">
                          {project.name
                            .slice(0, 1)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="truncate text-sm font-medium text-zinc-300">
                            {project.name}
                          </p>

                          <p className="mt-1 truncate text-[11px] text-zinc-600">
                            {project.techStack
                              .slice(0, 3)
                              .join(" · ") ||
                              "No tech stack"}
                          </p>

                        </div>

                        <span className="text-xs text-zinc-700">
                          →
                        </span>

                      </Link>

                    ))}

                </div>

              )}

            </section>


            {/* AI CARD */}

            <section className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-blue-500/3 p-6">

              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative">

                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                  ✦
                </div>

                <h2 className="font-semibold">
                  AI Investigation Engine
                </h2>

                <p className="mt-2 text-xs leading-6 text-zinc-500">
                  DevTraxe analyzes technical evidence,
                  identifies likely causes and generates
                  structured investigation workflows.
                </p>

                <div className="mt-5 flex items-center gap-2">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                  <span className="text-[11px] text-emerald-400">
                    Gemini engine operational
                  </span>

                </div>

              </div>

            </section>

          </div>

        </div>


        {/* BOTTOM CTA */}

        <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950">

          <div className="flex flex-col items-start justify-between gap-5 px-6 py-6 md:flex-row md:items-center">

            <div>

              <p className="text-xs uppercase tracking-wider text-zinc-600">
                Investigation workspace
              </p>

              <h2 className="mt-1 text-lg font-semibold">
                Have a production issue?
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Provide the evidence. Let DevTraxe build
                the investigation path.
              </p>

            </div>

            <Link
              href="/new-issue"
              className="whitespace-nowrap rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Start investigation →
            </Link>

          </div>

        </section>

      </div>

    </main>
  );
}