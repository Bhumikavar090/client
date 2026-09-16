"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface AIAnalysis {
  summary?: string;
  possibleCause?: string;
  suggestedAction?: string;
  investigationSteps?: string[];
  confidence?: number;
}

interface InvestigationStep {
  text: string;
  completed: boolean;
}

interface Investigation {
  steps: InvestigationStep[];
  findings: string;
  resolution: string;
}

interface Project {
  _id: string;
  name: string;
}

interface Issue {
  _id: string;
  title: string;
  description: string;
  technicalContext?: string;
  status: string;
  priority: string;
  category?: string;
  project?: Project;
  aiAnalysis?: AIAnalysis;
  investigation?: Investigation;
  createdAt: string;
}

export default function IssueDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const issueId = params.id as string;

  const [issue, setIssue] = useState<Issue | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] =
    useState("");

  const fetchIssue = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/issues/${issueId}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch issue"
        );
      }

      const data = await response.json();

      setIssue(data);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to load this investigation."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssue();
  }, [issueId]);

  const updateIssueState = (
    updater: (current: Issue) => Issue
  ) => {
    setIssue((current) =>
      current ? updater(current) : current
    );
  };

  const toggleStep = (index: number) => {
    updateIssueState((current) => ({
      ...current,

      investigation: {
        steps:
          current.investigation?.steps.map(
            (step, stepIndex) =>
              stepIndex === index
                ? {
                    ...step,
                    completed:
                      !step.completed,
                  }
                : step
          ) || [],

        findings:
          current.investigation?.findings ||
          "",

        resolution:
          current.investigation?.resolution ||
          "",
      },
    }));
  };

  const updateFindings = (
    value: string
  ) => {
    updateIssueState((current) => ({
      ...current,

      investigation: {
        steps:
          current.investigation?.steps || [],

        findings: value,

        resolution:
          current.investigation?.resolution ||
          "",
      },
    }));
  };

  const updateResolution = (
    value: string
  ) => {
    updateIssueState((current) => ({
      ...current,

      investigation: {
        steps:
          current.investigation?.steps || [],

        findings:
          current.investigation?.findings ||
          "",

        resolution: value,
      },
    }));
  };

  const saveInvestigation = async (
    status?: string
  ) => {
    if (!issue) return;

    try {
      setSaving(true);
      setError("");
      setSaveMessage("");

      const response = await fetch(
        `http://localhost:5000/api/issues/${issueId}/investigation`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            steps:
              issue.investigation?.steps || [],

            findings:
              issue.investigation?.findings ||
              "",

            resolution:
              issue.investigation?.resolution ||
              "",

            status:
              status || issue.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save investigation"
        );
      }

      setIssue(data.issue);

      setSaveMessage(
        status === "resolved"
          ? "Issue resolved successfully."
          : "Investigation progress saved."
      );

      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to save investigation."
      );
    } finally {
      setSaving(false);
    }
  };

  const steps =
    issue?.investigation?.steps || [];

  const completedSteps = steps.filter(
    (step) => step.completed
  ).length;

  const progress = useMemo(() => {
    if (steps.length === 0) return 0;

    return Math.round(
      (completedSteps / steps.length) * 100
    );
  }, [steps.length, completedSteps]);

  const confidence =
    issue?.aiAnalysis?.confidence || 0;

  const confidenceLabel =
    confidence >= 80
      ? "High confidence"
      : confidence >= 60
      ? "Moderate confidence"
      : "Low confidence";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#09090b] p-6 text-white">
        <div className="mx-auto max-w-7xl animate-pulse">

          <div className="mb-8 h-4 w-32 rounded bg-zinc-900" />

          <div className="h-10 w-2/3 rounded bg-zinc-900" />

          <div className="mt-3 h-5 w-1/2 rounded bg-zinc-900" />

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">

            <div className="h-162.5 rounded-2xl border border-zinc-800 bg-zinc-950" />

            <div className="h-125 rounded-2xl border border-zinc-800 bg-zinc-950" />

          </div>

        </div>
      </main>
    );
  }

  if (error || !issue) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] text-white">

        <div className="text-center">

          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            !
          </div>

          <p className="text-sm text-red-400">
            {error || "Issue not found"}
          </p>

          <button
            onClick={() =>
              router.push("/issues")
            }
            className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-zinc-200"
          >
            Back to issues
          </button>

        </div>

      </main>
    );
  }

  const formattedDate = new Date(
    issue.createdAt
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const canResolve =
    steps.length === 0 ||
    completedSteps === steps.length;

  return (
    <main className="min-h-screen bg-[#09090b] text-white">

      <div className="mx-auto max-w-7xl px-6 py-8">


        {/* TOP NAV */}

        <div className="mb-8 flex items-center justify-between">

          <button
            onClick={() =>
              router.push("/issues")
            }
            className="group flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>

            Issues
          </button>

          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-700">
            #{issue._id.slice(-8)}
          </span>

        </div>


        {/* ISSUE HEADER */}

        <header className="mb-8">

          <div className="mb-4 flex flex-wrap items-center gap-2">

            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                issue.priority === "critical"
                  ? "border-red-500/20 bg-red-500/6 text-red-400"
                  : issue.priority === "high"
                  ? "border-orange-500/20 bg-orange-500/6 text-orange-400"
                  : issue.priority === "medium"
                  ? "border-yellow-500/20 bg-yellow-500/6 text-yellow-400"
                  : "border-zinc-800 bg-zinc-900 text-zinc-500"
              }`}
            >
              {issue.priority}
            </span>

            <span className="rounded-full border border-purple-500/20 bg-purple-500/6 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-purple-400">
              {issue.status}
            </span>

            {issue.category && (
              <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                {issue.category}
              </span>
            )}

            {issue.project && (
              <>
                <span className="text-zinc-800">
                  /
                </span>

                <span className="text-xs text-zinc-500">
                  {issue.project.name}
                </span>
              </>
            )}

          </div>


          <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
            {issue.title}
          </h1>

          <p className="mt-4 max-w-4xl text-sm leading-7 text-zinc-500">
            {issue.description}
          </p>

          <p className="mt-4 text-[11px] text-zinc-700">
            Reported {formattedDate}
          </p>

        </header>


        {/* MAIN WORKSPACE */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">


          {/* LEFT */}

          <div className="space-y-6">


            {/* AI SUMMARY */}

            <section className="relative overflow-hidden rounded-2xl border border-blue-500/15 bg-blue-500/2.5">

              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />

              <div className="relative p-7">

                <div className="mb-6 flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                    ✦
                  </div>

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                      AI Investigation
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      Gemini-generated engineering analysis
                    </p>

                  </div>

                </div>


                {issue.aiAnalysis?.summary ? (

                  <div>

                    <p className="text-lg leading-8 text-zinc-200">
                      {issue.aiAnalysis.summary}
                    </p>


                    <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">

                      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5">

                        <div className="mb-3 flex items-center gap-2">

                          <span className="text-orange-400">
                            !
                          </span>

                          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Possible cause
                          </p>

                        </div>

                        <p className="text-sm leading-6 text-zinc-400">
                          {issue.aiAnalysis.possibleCause ||
                            "No cause identified."}
                        </p>

                      </div>


                      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5">

                        <div className="mb-3 flex items-center gap-2">

                          <span className="text-yellow-400">
                            →
                          </span>

                          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Suggested action
                          </p>

                        </div>

                        <p className="text-sm leading-6 text-zinc-400">
                          {issue.aiAnalysis.suggestedAction ||
                            "No action suggested."}
                        </p>

                      </div>

                    </div>

                  </div>

                ) : (

                  <p className="text-sm text-zinc-600">
                    AI analysis is not available.
                  </p>

                )}

              </div>

            </section>


            {/* CHECKLIST */}

            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950">

              <div className="border-b border-zinc-800/80 p-7">

                <div className="flex items-end justify-between gap-5">

                  <div>

                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                      Developer workflow
                    </p>

                    <h2 className="mt-2 text-xl font-semibold">
                      Investigation checklist
                    </h2>

                    <p className="mt-2 text-sm text-zinc-600">
                      Complete the recommended investigation path.
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-3xl font-semibold text-zinc-200">
                      {progress}%
                    </p>

                    <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-700">
                      {completedSteps} / {steps.length}
                    </p>

                  </div>

                </div>


                <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-zinc-900">

                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                    }}
                  />

                </div>

              </div>


              <div className="p-4">

                {steps.length === 0 ? (

                  <div className="p-7 text-center">

                    <p className="text-sm text-zinc-600">
                      No checklist steps available.
                    </p>

                  </div>

                ) : (

                  steps.map(
                    (step, index) => (

                      <button
                        key={`${issue._id}-${index}`}
                        onClick={() =>
                          toggleStep(index)
                        }
                        className={`group flex w-full items-start gap-4 rounded-xl p-4 text-left transition ${
                          step.completed
                            ? "bg-emerald-500/2.5]"
                            : "hover:bg-zinc-900/70"
                        }`}
                      >

                        <div className="flex flex-col items-center">

                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition ${
                              step.completed
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                : "border-zinc-800 bg-zinc-900 text-zinc-500 group-hover:border-blue-500/30 group-hover:text-blue-400"
                            }`}
                          >
                            {step.completed
                              ? "✓"
                              : index + 1}
                          </div>

                          {index <
                            steps.length - 1 && (
                            <div className="mt-2 h-5 w-px bg-zinc-800" />
                          )}

                        </div>


                        <div className="pt-1">

                          <p
                            className={`text-sm leading-6 transition ${
                              step.completed
                                ? "text-zinc-600 line-through"
                                : "text-zinc-300 group-hover:text-white"
                            }`}
                          >
                            {step.text}
                          </p>

                          <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-700">
                            Step {index + 1}
                          </p>

                        </div>

                      </button>

                    )
                  )

                )}

              </div>

            </section>


            {/* FINDINGS */}

            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-7">

              <div className="mb-5">

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                  Developer notes
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Investigation findings
                </h2>

                <p className="mt-2 text-sm text-zinc-600">
                  Capture evidence discovered during debugging.
                </p>

              </div>

              <textarea
                value={
                  issue.investigation?.findings ||
                  ""
                }
                onChange={(event) =>
                  updateFindings(
                    event.target.value
                  )
                }
                placeholder="Document logs, measurements, experiments, confirmed causes or rejected hypotheses..."
                rows={7}
                className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-4 text-sm leading-7 text-zinc-300 outline-none transition placeholder:text-zinc-700 focus:border-blue-500/40 focus:bg-zinc-900"
              />

            </section>


            {/* RESOLUTION */}

            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-7">

              <div className="mb-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    ✓
                  </div>

                  <div>

                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                      Resolution
                    </p>

                    <h2 className="mt-1 text-xl font-semibold">
                      Document the fix
                    </h2>

                  </div>

                </div>

                <p className="mt-4 text-sm text-zinc-600">
                  Record the confirmed root cause and the solution that was applied.
                </p>

              </div>

              <textarea
                value={
                  issue.investigation?.resolution ||
                  ""
                }
                onChange={(event) =>
                  updateResolution(
                    event.target.value
                  )
                }
                placeholder="What caused the issue? What changed? How was the fix verified?"
                rows={7}
                className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-4 text-sm leading-7 text-zinc-300 outline-none transition placeholder:text-zinc-700 focus:border-emerald-500/30 focus:bg-zinc-900"
              />

            </section>


            {/* ACTION BAR */}

            <div className="sticky bottom-5 z-20 flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-[#0d0d10]/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl">

              <div className="px-3">

                {saveMessage ? (

                  <p className="text-xs text-emerald-400">
                    {saveMessage}
                  </p>

                ) : (

                  <p className="hidden text-xs text-zinc-600 sm:block">
                    Save your investigation progress.
                  </p>

                )}

              </div>


              <div className="flex gap-2">

                <button
                  onClick={() =>
                    saveInvestigation(
                      "investigating"
                    )
                  }
                  disabled={saving}
                  className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:opacity-40"
                >
                  {saving
                    ? "Saving..."
                    : "Save progress"}
                </button>


                <button
                  onClick={() =>
                    saveInvestigation(
                      "resolved"
                    )
                  }
                  disabled={
                    saving || !canResolve
                  }
                  className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Mark resolved →
                </button>

              </div>

            </div>

          </div>


          {/* RIGHT SIDEBAR */}

          <aside className="space-y-5">


            {/* CONFIDENCE */}

            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-6">

              <div className="mb-6 flex items-center justify-between">

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                  AI confidence
                </p>

                <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.5)]" />

              </div>

              <div className="flex items-end justify-between">

                <p className="text-4xl font-semibold tracking-tight">
                  {confidence}%
                </p>

                <p className="pb-1 text-[10px] text-zinc-600">
                  {confidenceLabel}
                </p>

              </div>

              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-zinc-900">

                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-700"
                  style={{
                    width: `${confidence}%`,
                  }}
                />

              </div>

            </section>


            {/* ISSUE META */}

            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-6">

              <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                Issue details
              </p>


              <div className="space-y-5">

                <div>

                  <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-700">
                    Status
                  </p>

                  <p className="text-sm capitalize text-zinc-300">
                    {issue.status}
                  </p>

                </div>


                <div>

                  <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-700">
                    Priority
                  </p>

                  <p className="text-sm capitalize text-zinc-300">
                    {issue.priority}
                  </p>

                </div>


                <div>

                  <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-700">
                    Category
                  </p>

                  <p className="text-sm capitalize text-zinc-300">
                    {issue.category ||
                      "Unclassified"}
                  </p>

                </div>


                <div>

                  <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-700">
                    Project
                  </p>

                  <p className="text-sm text-zinc-300">
                    {issue.project?.name ||
                      "Unknown"}
                  </p>

                </div>

              </div>

            </section>


            {/* EVIDENCE */}

            {issue.technicalContext && (

              <section className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950">

                <details>

                  <summary className="cursor-pointer list-none p-6">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                          Evidence
                        </p>

                        <h3 className="mt-2 font-semibold">
                          Technical context
                        </h3>

                      </div>

                      <span className="text-zinc-700">
                        +
                      </span>

                    </div>

                    <p className="mt-3 text-xs leading-5 text-zinc-600">
                      Logs, stack traces and developer-provided context.
                    </p>

                  </summary>


                  <div className="border-t border-zinc-800 p-5">

                    <pre className="max-h-125 overflow-auto whitespace-pre-wrap wrap-break-words rounded-xl bg-black/40 p-4 font-mono text-[11px] leading-6 text-zinc-500">
                      {issue.technicalContext}
                    </pre>

                  </div>

                </details>

              </section>

            )}


            {/* WORKFLOW STATUS */}

            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-6">

              <div className="flex items-center gap-3">

                <div
                  className={`h-2 w-2 rounded-full ${
                    issue.status ===
                    "resolved"
                      ? "bg-emerald-400"
                      : "bg-purple-400"
                  }`}
                />

                <div>

                  <p className="text-xs font-medium capitalize text-zinc-300">
                    {issue.status}
                  </p>

                  <p className="mt-1 text-[10px] text-zinc-700">
                    Investigation state
                  </p>

                </div>

              </div>

            </section>

          </aside>

        </div>

      </div>

    </main>
  );
}