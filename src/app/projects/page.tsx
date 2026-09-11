"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Issue {
  _id: string;
  title: string;
  status: string;
  priority: string;
  category?: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  techStack: string[];
  createdAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  const [issuesByProject, setIssuesByProject] =
    useState<Record<string, Issue[]>>({});

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [techStack, setTechStack] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/projects"
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch projects"
        );
      }

      const data = await response.json();

      setProjects(data);

      const issueResults =
        await Promise.all(
          data.map(async (project: Project) => {
            const issueResponse =
              await fetch(
                `http://localhost:5000/api/issues/project/${project._id}`
              );

            if (!issueResponse.ok) {
              return {
                projectId: project._id,
                issues: [],
              };
            }

            const issues =
              await issueResponse.json();

            return {
              projectId: project._id,
              issues,
            };
          })
        );

      const issueMap: Record<
        string,
        Issue[]
      > = {};

      issueResults.forEach((result) => {
        issueMap[result.projectId] =
          result.issues;
      });

      setIssuesByProject(issueMap);
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

  const createProject = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/projects",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),

            description:
              description.trim(),

            techStack: techStack
              .split(",")
              .map((item) =>
                item.trim()
              )
              .filter(Boolean),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to create project"
        );
      }

      setName("");
      setDescription("");
      setTechStack("");

      await fetchProjects();
    } catch (error) {
      console.error(error);

      setError(
        "Unable to create project."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
          <div>
            <p className="text-sm text-blue-400 mb-2">
              DEVTRAXE AI
            </p>

            <h1 className="text-3xl font-semibold">
              Projects
            </h1>

            <p className="text-zinc-500 mt-2">
              Organize software issues by project.
            </p>
          </div>

          <Link
            href="/new-issue"
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition"
          >
            + Report issue
          </Link>
        </div>


        {/* CREATE PROJECT */}

        <section className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-1">
            Create project
          </h2>

          <p className="text-sm text-zinc-500 mb-6">
            Create a project to group related
            issues and investigations.
          </p>

          <form
            onSubmit={createProject}
            className="space-y-4"
          >
            <input
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Project name"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Project description"
              rows={3}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-blue-500 resize-none"
            />

            <input
              value={techStack}
              onChange={(event) =>
                setTechStack(
                  event.target.value
                )
              }
              placeholder="Tech stack: React, Node.js, MongoDB"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              disabled={
                creating ||
                !name.trim()
              }
              className="px-5 py-3 rounded-xl bg-white text-black font-medium disabled:opacity-40 hover:bg-zinc-200 transition"
            >
              {creating
                ? "Creating..."
                : "Create project"}
            </button>
          </form>
        </section>


        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            {error}
          </div>
        )}


        {/* PROJECTS */}

        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">
              Your projects
            </h2>

            <span className="text-sm text-zinc-500">
              {projects.length} projects
            </span>
          </div>


          {loading ? (
            <div className="border border-zinc-800 rounded-2xl p-10 text-center">
              <p className="text-zinc-500">
                Loading projects...
              </p>
            </div>
          ) : projects.length === 0 ? (
            <div className="border border-zinc-800 rounded-2xl p-10 text-center">
              <p className="text-zinc-500">
                No projects yet.
              </p>
            </div>
          ) : (
            <div className="space-y-5">

              {projects.map((project) => {
                const projectIssues =
                  issuesByProject[
                    project._id
                  ] || [];

                return (
                  <div
                    key={project._id}
                    className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6"
                  >

                    {/* PROJECT HEADER */}

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">

                      <div>
                        <h3 className="text-xl font-semibold">
                          {project.name}
                        </h3>

                        <p className="text-sm text-zinc-500 mt-2">
                          {project.description ||
                            "No description provided."}
                        </p>
                      </div>

                      <span className="text-sm text-zinc-500">
                        {projectIssues.length}{" "}
                        {projectIssues.length ===
                        1
                          ? "issue"
                          : "issues"}
                      </span>
                    </div>


                    {/* TECH STACK */}

                    {project.techStack.length >
                      0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.techStack.map(
                          (technology) => (
                            <span
                              key={technology}
                              className="px-2.5 py-1 rounded-full border border-zinc-800 bg-zinc-900 text-xs text-zinc-400"
                            >
                              {technology}
                            </span>
                          )
                        )}
                      </div>
                    )}


                    {/* ISSUES */}

                    {projectIssues.length ===
                    0 ? (
                      <div className="border border-dashed border-zinc-800 rounded-xl p-6 text-center">
                        <p className="text-sm text-zinc-600">
                          No issues reported for this
                          project yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">

                        {projectIssues.map(
                          (issue) => (
                            <Link
                              key={issue._id}
                              href={`/issues/${issue._id}`}
                              className="block border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 hover:bg-zinc-900/50 transition"
                            >
                              <div className="flex items-start justify-between gap-4">

                                <div>
                                  <h4 className="font-medium text-zinc-200">
                                    {issue.title}
                                  </h4>

                                  <div className="flex flex-wrap gap-2 mt-3">

                                    <span className="px-2 py-1 rounded-full text-[11px] border border-zinc-800 bg-zinc-900 text-zinc-400">
                                      {issue.priority}
                                    </span>

                                    <span className="px-2 py-1 rounded-full text-[11px] border border-zinc-800 bg-zinc-900 text-zinc-400">
                                      {issue.status}
                                    </span>

                                    {issue.category && (
                                      <span className="px-2 py-1 rounded-full text-[11px] border border-zinc-800 bg-zinc-900 text-zinc-500">
                                        {issue.category}
                                      </span>
                                    )}

                                  </div>
                                </div>

                                <span className="text-sm text-zinc-600">
                                  →
                                </span>

                              </div>
                            </Link>
                          )
                        )}

                      </div>
                    )}

                  </div>
                );
              })}

            </div>
          )}
        </section>
      </div>
    </main>
  );
}