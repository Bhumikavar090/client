"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Project {
  _id: string;
  name: string;
}

export default function NewIssuePage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [technicalContext, setTechnicalContext] =
    useState("");
  const [project, setProject] = useState("");

  const [loadingProjects, setLoadingProjects] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
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

        if (data.length > 0) {
          setProject(data[0]._id);
        }
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load projects."
        );
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!title.trim() || !description.trim()) {
      setError(
        "Title and description are required."
      );
      return;
    }

    if (!project) {
      setError(
        "Please select a project."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/issues",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            priority,
            technicalContext:
              technicalContext.trim(),
            project,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create issue"
        );
      }

      router.push(
        `/issues/${data.issue._id}`
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create issue."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="max-w-4xl mx-auto px-6 py-10">

        <button
          onClick={() => router.push("/issues")}
          className="text-sm text-zinc-400 hover:text-white transition mb-8"
        >
          ← Back to issues
        </button>

        <div className="mb-10">
          <p className="text-sm text-blue-400 mb-2">
            DEVTRAXE AI
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Report an issue
          </h1>

          <p className="text-zinc-500 mt-2">
            Describe the problem and let DevTraxe AI
            investigate it.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* PROJECT */}

          <div className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6">
            <label className="block text-sm font-medium mb-3">
              Project
            </label>

            {loadingProjects ? (
              <p className="text-sm text-zinc-500">
                Loading projects...
              </p>
            ) : projects.length === 0 ? (
              <div>
                <p className="text-sm text-red-400 mb-3">
                  No projects found. Create a project
                  before reporting an issue.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/projects")
                  }
                  className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium"
                >
                  Create project
                </button>
              </div>
            ) : (
              <select
                value={project}
                onChange={(event) =>
                  setProject(event.target.value)
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-200 outline-none focus:border-blue-500"
              >
                {projects.map((item) => (
                  <option
                    key={item._id}
                    value={item._id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            )}
          </div>


          {/* ISSUE DETAILS */}

          <div className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6 space-y-5">

            <div>
              <label className="block text-sm font-medium mb-3">
                Issue title
              </label>

              <input
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Users are randomly logged out"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>


            <div>
              <label className="block text-sm font-medium mb-3">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Describe what is happening..."
                rows={6}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-blue-500 resize-none"
              />
            </div>


            <div>
              <label className="block text-sm font-medium mb-3">
                Priority
              </label>

              <select
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value)
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
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


            <div>
              <label className="block text-sm font-medium mb-3">
                Technical context
              </label>

              <textarea
                value={technicalContext}
                onChange={(event) =>
                  setTechnicalContext(
                    event.target.value
                  )
                }
                placeholder="Logs, stack traces, API responses, recent changes..."
                rows={8}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-mono outline-none focus:border-blue-500 resize-none"
              />
            </div>

          </div>


          {/* ERROR */}

          {error && (
            <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-4 text-sm text-red-400">
              {error}
            </div>
          )}


          {/* SUBMIT */}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                submitting ||
                loadingProjects ||
                projects.length === 0
              }
              className="px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition disabled:opacity-40"
            >
              {submitting
                ? "Creating & analyzing..."
                : "Create & analyze issue"}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}