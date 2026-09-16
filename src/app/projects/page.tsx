"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface Project {
  _id: string;
  name: string;
  description: string;
  techStack: string[];
  createdAt: string;
}

interface Issue {
  _id: string;
  title: string;
  status: string;
  priority: string;
  category?: string;
  createdAt: string;
}

interface ProjectWithIssues extends Project {
  issues: Issue[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithIssues[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/projects"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data: Project[] = await response.json();

      const projectsWithIssues =
        await Promise.all(
          data.map(async (project) => {
            try {
              const issueResponse = await fetch(
                `http://localhost:5000/api/issues/project/${project._id}`
              );

              if (!issueResponse.ok) {
                return {
                  ...project,
                  issues: [],
                };
              }

              const issues =
                await issueResponse.json();

              return {
                ...project,
                issues,
              };
            } catch {
              return {
                ...project,
                issues: [],
              };
            }
          })
        );

      setProjects(projectsWithIssues);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        "http://localhost:5000/api/projects",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            techStack: techStack
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create project"
        );
      }

      setName("");
      setDescription("");
      setTechStack("");

      setSuccess(
        "Project created successfully."
      );

      await fetchProjects();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create project."
      );
    } finally {
      setCreating(false);
    }
  };

  const stats = useMemo(() => {
    const totalIssues = projects.reduce(
      (total, project) =>
        total + project.issues.length,
      0
    );

    const activeIssues = projects.reduce(
      (total, project) =>
        total +
        project.issues.filter(
          (issue) =>
            issue.status !== "resolved"
        ).length,
      0
    );

    const resolvedIssues = projects.reduce(
      (total, project) =>
        total +
        project.issues.filter(
          (issue) =>
            issue.status === "resolved"
        ).length,
      0
    );

    return {
      projects: projects.length,
      totalIssues,
      activeIssues,
      resolvedIssues,
    };
  }, [projects]);

  return (
    <main className="min-h-screen bg-[#09090b] text-white">

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* HEADER */}

        <div className="mb-9 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

          <div>

            <div className="mb-3 flex items-center gap-2">

              <span className="text-xs font-medium uppercase tracking-[0.18em] text-blue-400">
                Workspace
              </span>

              <span className="h-1 w-1 rounded-full bg-zinc-700" />

              <span className="text-xs text-zinc-600">
                {stats.projects} projects
              </span>

            </div>

            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Projects
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
              Organize software systems and connect
              their engineering issues to a single
              investigation workspace.
            </p>

          </div>

          <Link
            href="/new-issue"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            <span>+</span>
            Report issue
          </Link>

        </div>


        {/* METRICS */}

        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">

          <Metric
            label="Projects"
            value={loading ? "—" : stats.projects}
          />

          <Metric
            label="Total issues"
            value={loading ? "—" : stats.totalIssues}
          />

          <Metric
            label="Active issues"
            value={loading ? "—" : stats.activeIssues}
            accent="text-blue-400"
          />

          <Metric
            label="Resolved"
            value={loading ? "—" : stats.resolvedIssues}
            accent="text-emerald-400"
          />

        </div>


        {/* CREATE PROJECT */}

        <section className="mb-8 overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950">

          <div className="border-b border-zinc-800/80 px-6 py-5">

            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
              Project setup
            </p>

            <h2 className="mt-2 text-lg font-semibold">
              Create a project
            </h2>

            <p className="mt-1 text-sm text-zinc-600">
              Add a software system before reporting
              its issues.
            </p>

          </div>


          <form
            onSubmit={handleCreateProject}
            className="grid gap-5 p-6 lg:grid-cols-[1fr_1.4fr_1fr_auto]"
          >

            <div>

              <label className="mb-2 block text-xs font-medium text-zinc-500">
                Project name
              </label>

              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. DevTraxe AI"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-blue-500/40"
              />

            </div>


            <div>

              <label className="mb-2 block text-xs font-medium text-zinc-500">
                Description
              </label>

              <input
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="What does this project do?"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-blue-500/40"
              />

            </div>


            <div>

              <label className="mb-2 block text-xs font-medium text-zinc-500">
                Tech stack
              </label>

              <input
                value={techStack}
                onChange={(event) =>
                  setTechStack(
                    event.target.value
                  )
                }
                placeholder="Next.js, Node.js, MongoDB"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-blue-500/40"
              />

            </div>


            <div className="flex items-end">

              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 lg:w-auto"
              >
                {creating
                  ? "Creating..."
                  : "Create project"}
              </button>

            </div>

          </form>


          {(error || success) && (
            <div className="border-t border-zinc-800/80 px-6 py-4">

              {error && (
                <p className="text-sm text-red-400">
                  {error}
                </p>
              )}

              {success && (
                <p className="text-sm text-emerald-400">
                  {success}
                </p>
              )}

            </div>
          )}

        </section>


        {/* PROJECT LIST */}

        <div className="mb-5 flex items-center justify-between">

          <div>

            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
              Your workspace
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              All projects
            </h2>

          </div>

          {!loading && (
            <button
              onClick={fetchProjects}
              className="rounded-lg px-3 py-2 text-xs text-zinc-600 transition hover:bg-zinc-900 hover:text-white"
            >
              ↻ Refresh
            </button>
          )}

        </div>


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


        {!loading &&
          !error &&
          projects.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/50 p-16 text-center">

              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-xl text-zinc-600">
                □
              </div>

              <h2 className="text-lg font-semibold">
                No projects yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
                Create your first project to start
                organizing software issues and AI
                investigations.
              </p>

            </div>
          )}


        {!loading &&
          projects.length > 0 && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

              {projects.map((project) => {

                const activeIssues =
                  project.issues.filter(
                    (issue) =>
                      issue.status !==
                      "resolved"
                  ).length;

                const resolvedIssues =
                  project.issues.filter(
                    (issue) =>
                      issue.status ===
                      "resolved"
                  ).length;

                return (
                  <article
                    key={project._id}
                    className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#0d0d10] transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-[#101014]"
                  >

                    <div className="absolute left-0 top-0 h-px w-0 bg-blue-400 transition-all duration-300 group-hover:w-full" />


                    <div className="p-6">

                      {/* PROJECT HEADER */}

                      <div className="flex items-start justify-between gap-5">

                        <div className="flex min-w-0 items-center gap-4">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                            □
                          </div>

                          <div className="min-w-0">

                            <h3 className="truncate text-lg font-semibold text-zinc-100">
                              {project.name}
                            </h3>

                            <p className="mt-1 text-[11px] text-zinc-700">
                              PROJECT ·{" "}
                              {project._id.slice(
                                -8
                              )}
                            </p>

                          </div>

                        </div>

                        <span className="whitespace-nowrap rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[10px] text-zinc-500">
                          {project.issues.length}{" "}
                          issues
                        </span>

                      </div>


                      {/* DESCRIPTION */}

                      <p className="mt-6 line-clamp-2 min-h-12 text-sm leading-6 text-zinc-500">
                        {project.description ||
                          "No project description provided."}
                      </p>


                      {/* TECH STACK */}

                      <div className="mt-5 flex min-h-7 flex-wrap gap-2">

                        {project.techStack.length >
                        0 ? (
                          project.techStack.map(
                            (tech) => (
                              <span
                                key={tech}
                                className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[10px] text-zinc-500"
                              >
                                {tech}
                              </span>
                            )
                          )
                        ) : (
                          <span className="text-[11px] text-zinc-700">
                            No technology stack specified
                          </span>
                        )}

                      </div>


                      {/* ISSUE SUMMARY */}

                      <div className="mt-6 grid grid-cols-3 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950">

                        <div className="p-4">

                          <p className="text-[9px] uppercase tracking-wider text-zinc-700">
                            Issues
                          </p>

                          <p className="mt-1 text-lg font-semibold text-zinc-300">
                            {project.issues.length}
                          </p>

                        </div>

                        <div className="border-l border-zinc-800/80 p-4">

                          <p className="text-[9px] uppercase tracking-wider text-zinc-700">
                            Active
                          </p>

                          <p className="mt-1 text-lg font-semibold text-blue-400">
                            {activeIssues}
                          </p>

                        </div>

                        <div className="border-l border-zinc-800/80 p-4">

                          <p className="text-[9px] uppercase tracking-wider text-zinc-700">
                            Resolved
                          </p>

                          <p className="mt-1 text-lg font-semibold text-emerald-400">
                            {resolvedIssues}
                          </p>

                        </div>

                      </div>


                      {/* ISSUES */}

                      {project.issues.length >
                        0 && (
                        <div className="mt-6 border-t border-zinc-800/80 pt-5">

                          <div className="mb-3 flex items-center justify-between">

                            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                              Recent issues
                            </p>

                            <span className="text-[10px] text-zinc-700">
                              {Math.min(
                                3,
                                project.issues
                                  .length
                              )}{" "}
                              shown
                            </span>

                          </div>

                          <div className="space-y-2">

                            {project.issues
                              .slice(0, 3)
                              .map(
                                (issue) => (
                                  <Link
                                    key={
                                      issue._id
                                    }
                                    href={`/issues/${issue._id}`}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800/70 bg-zinc-900/40 px-3 py-3 transition hover:border-zinc-700 hover:bg-zinc-900"
                                  >

                                    <span className="min-w-0 truncate text-xs text-zinc-400">
                                      {issue.title}
                                    </span>

                                    <span
                                      className={`shrink-0 text-[9px] uppercase tracking-wider ${
                                        issue.status ===
                                        "resolved"
                                          ? "text-emerald-400"
                                          : issue.priority ===
                                            "critical"
                                          ? "text-red-400"
                                          : "text-zinc-600"
                                      }`}
                                    >
                                      {issue.status}
                                    </span>

                                  </Link>
                                )
                              )}

                          </div>

                        </div>
                      )}


                      {/* FOOTER */}

                      <div className="mt-6 flex items-center justify-between border-t border-zinc-800/80 pt-5">

                        <span className="text-[10px] text-zinc-700">
                          Created{" "}
                          {new Date(
                            project.createdAt
                          ).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>

                        <Link
                          href="/new-issue"
                          className="text-xs font-medium text-zinc-600 transition hover:text-blue-400"
                        >
                          Report issue →
                        </Link>

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

      </div>

    </main>
  );
}


function Metric({
  label,
  value,
  accent = "text-zinc-200",
}: {
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950 px-4 py-4">

      <p className="text-[10px] uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p
        className={`mt-2 text-xl font-semibold ${accent}`}
      >
        {value}
      </p>

    </div>
  );
}