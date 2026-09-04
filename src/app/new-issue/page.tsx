"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

export default function NewIssuePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/issues",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            priority,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create issue"
        );
      }

      router.push("/issues");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />

      <main className="flex-1 px-8 py-10 lg:px-14">
        <div className="mx-auto max-w-3xl">
          <button
            onClick={() => router.back()}
            className="mb-8 flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="mb-10">
            <p className="text-sm text-blue-400">
              New investigation
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Report an issue
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
              Describe the problem clearly. DevTraxe will analyze the
              issue and help identify possible causes and related
              incidents.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8"
          >
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-zinc-200"
              >
                Issue title
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="e.g. Users are randomly getting logged out"
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
              />
            </div>

            <div className="mt-6 space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-zinc-200"
              >
                Describe the issue
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="What happened? When did it start? Which users or systems are affected?"
                required
                rows={8}
                className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
              />
            </div>

            <div className="mt-6 space-y-2">
              <label
                htmlFor="priority"
                className="text-sm font-medium text-zinc-200"
              >
                Initial priority
              </label>

              <select
                id="priority"
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value)
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              >
                <option value="low">
                  Low — Minor inconvenience
                </option>

                <option value="medium">
                  Medium — Needs investigation
                </option>

                <option value="high">
                  High — Major functionality affected
                </option>

                <option value="critical">
                  Critical — Severe production impact
                </option>
              </select>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3 border-t border-zinc-800 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg px-4 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                {isSubmitting
                  ? "Creating issue..."
                  : "Create issue"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}