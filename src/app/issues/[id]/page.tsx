"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ActivityTimeline from "@/components/ActivityTimeline";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
  updatedAt?: string;
}

interface FindingsAnalysis {
  rootCause: string;
  evidenceAssessment: string;
  nextAction: string;
  resolutionConfidence: number;
  sufficientEvidence: boolean;
}

export default function IssueDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const issueId = params.id as string;

  const [issue, setIssue] = useState<Issue | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzingFindings, setAnalyzingFindings] = useState(false);

  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [analysisError, setAnalysisError] = useState("");

  const [findingsAnalysis, setFindingsAnalysis] =
    useState<FindingsAnalysis | null>(null);

  const [activityRefresh, setActivityRefresh] = useState(0);

  const fetchIssue = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/issues/${issueId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch issue");
      }

      const data = await response.json();

      setIssue(data);
    } catch (err) {
      console.error(err);

      setError("Unable to load this investigation.");
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    fetchIssue();
  }, [fetchIssue]);

  const recordActivity = async (
    action: string,
    message: string,
    metadata: Record<string, unknown> = {}
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/api/issues/${issueId}/activity`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            message,
            metadata,
          }),
        }
      );

      if (!response.ok) {
        console.warn("Activity logging failed.");
        return;
      }

      setActivityRefresh((value) => value + 1);
    } catch (err) {
      console.warn("Activity logging failed:", err);
    }
  };

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
                    completed: !step.completed,
                  }
                : step
          ) || [],

        findings:
          current.investigation?.findings || "",

        resolution:
          current.investigation?.resolution || "",
      },
    }));
  };

  const updateFindings = (value: string) => {
    updateIssueState((current) => ({
      ...current,

      investigation: {
        steps:
          current.investigation?.steps || [],

        findings: value,

        resolution:
          current.investigation?.resolution || "",
      },
    }));

    setFindingsAnalysis(null);
    setAnalysisError("");
  };

  const updateResolution = (value: string) => {
    updateIssueState((current) => ({
      ...current,

      investigation: {
        steps:
          current.investigation?.steps || [],

        findings:
          current.investigation?.findings || "",

        resolution: value,
      },
    }));
  };

  const saveInvestigation = async (
    status?: string
  ) => {
    if (!issue) return;

    const previousStatus = issue.status;
    const nextStatus = status || issue.status;

    try {
      setSaving(true);
      setError("");
      setSaveMessage("");

      const response = await fetch(
        `${API_URL}/api/issues/${issueId}/investigation`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            steps:
              issue.investigation?.steps || [],

            findings:
              issue.investigation?.findings || "",

            resolution:
              issue.investigation?.resolution || "",

            status: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save investigation."
        );
      }

      setIssue(data.issue);

      let activityAction =
        "INVESTIGATION_UPDATED";

      let activityMessage =
        "Developer saved investigation progress.";

      if (
        previousStatus !== "investigating" &&
        nextStatus === "investigating"
      ) {
        activityAction = "INVESTIGATION_STARTED";
        activityMessage =
          "Developer started investigating the issue.";
      }

      if (nextStatus === "resolved") {
        activityAction = "ISSUE_RESOLVED";
        activityMessage =
          "Issue was marked as resolved.";
      }

      const currentSteps =
        issue.investigation?.steps || [];

      await recordActivity(
        activityAction,
        activityMessage,
        {
          status: nextStatus,
          completedSteps:
            currentSteps.filter(
              (step) => step.completed
            ).length,
          totalSteps: currentSteps.length,
        }
      );

      setSaveMessage(
        nextStatus === "resolved"
          ? "Issue resolved successfully."
          : "Investigation progress saved."
      );

      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save investigation."
      );
    } finally {
      setSaving(false);
    }
  };

  const analyzeDeveloperFindings = async () => {
    if (!issue) return;

    const findings =
      issue.investigation?.findings?.trim() || "";

    if (!findings) {
      setAnalysisError(
        "Add some developer findings before running the analysis."
      );
      return;
    }

    try {
      setAnalyzingFindings(true);
      setAnalysisError("");
      setFindingsAnalysis(null);

      const response = await fetch(
        `${API_URL}/api/issues/${issueId}/analyze-findings`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            findings,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to analyze findings."
        );
      }

      setFindingsAnalysis(data.analysis);

      await recordActivity(
        "FINDINGS_ANALYZED",
        "Developer findings were analyzed by DevTrace AI.",
        {
          resolutionConfidence:
            data.analysis?.resolutionConfidence || 0,
          sufficientEvidence:
            data.analysis?.sufficientEvidence || false,
        }
      );
    } catch (err) {
      console.error(err);

      setAnalysisError(
        err instanceof Error
          ? err.message
          : "Failed to analyze findings."
      );
    } finally {
      setAnalyzingFindings(false);
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

  const canResolve =
    steps.length === 0 ||
    completedSteps === steps.length;

  const formattedCreatedDate = issue
    ? new Date(issue.createdAt).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      )
    : "";

  const formattedUpdatedDate =
    issue?.updatedAt
      ? new Date(
          issue.updatedAt
        ).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : formattedCreatedDate;

  const priorityClasses =
    issue?.priority === "critical"
      ? "border-red-500/20 bg-red-500/10 text-red-400"
      : issue?.priority === "high"
      ? "border-orange-500/20 bg-orange-500/10 text-orange-400"
      : issue?.priority === "medium"
      ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
      : "border-zinc-700 bg-zinc-900 text-zinc-400";

  const statusClasses =
    issue?.status === "resolved"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
      : issue?.status === "investigating"
      ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
      : "border-zinc-700 bg-zinc-900 text-zinc-400";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#09090b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="animate-pulse">
            <div className="h-5 w-28 rounded bg-zinc-900" />

            <div className="mt-10 h-4 w-48 rounded bg-zinc-900" />

            <div className="mt-4 h-10 w-3/4 rounded bg-zinc-900" />

            <div className="mt-4 h-5 w-1/2 rounded bg-zinc-900" />

            <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="space-y-6">
                <div className="h-48 rounded-2xl border border-zinc-800 bg-zinc-950" />
                <div className="h-96 rounded-2xl border border-zinc-800 bg-zinc-950" />
                <div className="h-72 rounded-2xl border border-zinc-800 bg-zinc-950" />
              </div>

              <div className="h-96 rounded-2xl border border-zinc-800 bg-zinc-950" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !issue) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-6 text-white">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
            !
          </div>

          <h1 className="mt-5 text-lg font-semibold">
            Investigation unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {error || "Issue not found."}
          </p>

          <button
            onClick={() => router.push("/issues")}
            className="mt-6 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            Back to issues
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      {/* NAVBAR */}

      <nav className="border-b border-zinc-900 bg-[#09090b]/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <button
            onClick={() => router.push("/issues")}
            className="flex items-center gap-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 font-mono text-xs font-bold text-white">
              D
            </div>

            <span className="text-sm font-semibold tracking-tight">
              DevTrace
            </span>
          </button>

          <div className="hidden items-center gap-6 text-xs text-zinc-600 sm:flex">
            <span>Issues</span>
            <span>Projects</span>
            <span>Developer workspace</span>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* BREADCRUMB */}

        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.push("/issues")}
            className="group flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>

            Back to issues
          </button>

          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-700">
            #{issue._id.slice(-8)}
          </span>
        </div>

        {/* ISSUE HEADER */}

        <header className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${priorityClasses}`}
            >
              {issue.priority}
            </span>

            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${statusClasses}`}
            >
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

          <h1 className="max-w-5xl text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
            {issue.title}
          </h1>

          <p className="mt-4 max-w-4xl text-sm leading-7 text-zinc-500">
            {issue.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-zinc-700">
            <span>
              Created {formattedCreatedDate}
            </span>

            <span>
              Updated {formattedUpdatedDate}
            </span>

            {issue.project && (
              <span>
                Project: {issue.project.name}
              </span>
            )}
          </div>
        </header>

        {/* MAIN WORKSPACE */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* LEFT */}

          <div className="space-y-6">
            {/* INVESTIGATION */}

            <section className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950">
              <div className="border-b border-zinc-800/80 p-7">
                <div className="flex items-end justify-between gap-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                      Investigation
                    </p>

                    <h2 className="mt-2 text-xl font-semibold text-zinc-100">
                      Developer workflow
                    </h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">
                      Work through the investigation path and record what you discover.
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-3xl font-semibold text-zinc-200">
                      {progress}%
                    </p>

                    <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-700">
                      {completedSteps} /{" "}
                      {steps.length} complete
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
                      No investigation steps were generated.
                    </p>
                  </div>
                ) : (
                  steps.map((step, index) => (
                    <button
                      key={`${issue._id}-${index}`}
                      onClick={() =>
                        toggleStep(index)
                      }
                      className="group flex w-full items-start gap-4 rounded-xl p-4 text-left transition hover:bg-zinc-900/70"
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition ${
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
                  ))
                )}
              </div>
            </section>

            {/* FINDINGS */}

            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-7">
              <div className="mb-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                  Developer findings
                </p>

                <h2 className="mt-2 text-xl font-semibold text-zinc-100">
                  What did you discover?
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                  Capture logs, experiments, confirmed causes, rejected hypotheses, and other useful evidence.
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
                placeholder="Example: The API returns 500 only when the request contains an expired token. Fresh tokens work correctly..."
                rows={8}
                className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-4 text-sm leading-7 text-zinc-300 outline-none transition placeholder:text-zinc-700 focus:border-blue-500/40 focus:bg-zinc-900"
              />

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-zinc-700">
                  DevTrace AI will evaluate your evidence against the current investigation.
                </p>

                <button
                  onClick={analyzeDeveloperFindings}
                  disabled={
                    analyzingFindings ||
                    !issue.investigation?.findings?.trim()
                  }
                  className="rounded-xl bg-blue-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {analyzingFindings
                    ? "Analyzing..."
                    : "Analyze findings"}
                </button>
              </div>

              {analysisError && (
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400">
                  {analysisError}
                </div>
              )}
            </section>

            {/* FINDINGS AI RESULT */}

            {findingsAnalysis && (
              <section className="rounded-2xl border border-blue-500/20 bg-zinc-950">
                <div className="border-b border-zinc-800/80 p-7">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                        AI assessment
                      </p>

                      <h2 className="mt-2 text-xl font-semibold text-zinc-100">
                        Evidence review
                      </h2>
                    </div>

                    <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400">
                      {
                        findingsAnalysis.resolutionConfidence
                      }
                      % confidence
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-px bg-zinc-800/70 md:grid-cols-2">
                  <div className="bg-zinc-950 p-6">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                      Likely root cause
                    </p>

                    <p className="mt-3 text-sm leading-7 text-zinc-300">
                      {findingsAnalysis.rootCause}
                    </p>
                  </div>

                  <div className="bg-zinc-950 p-6">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                      Evidence assessment
                    </p>

                    <p className="mt-3 text-sm leading-7 text-zinc-300">
                      {
                        findingsAnalysis.evidenceAssessment
                      }
                    </p>
                  </div>

                  <div className="bg-zinc-950 p-6 md:col-span-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                      Recommended next action
                    </p>

                    <p className="mt-3 text-sm leading-7 text-zinc-300">
                      {findingsAnalysis.nextAction}
                    </p>
                  </div>
                </div>

                <div className="border-t border-zinc-800/80 p-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        findingsAnalysis.sufficientEvidence
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {findingsAnalysis.sufficientEvidence
                        ? "✓"
                        : "!"}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-zinc-300">
                        {findingsAnalysis.sufficientEvidence
                          ? "Evidence may be sufficient for resolution"
                          : "More evidence is recommended"}
                      </p>

                      <p className="mt-1 text-[11px] text-zinc-700">
                        AI assessment is advisory. Verify the root cause before resolving the issue.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ORIGINAL AI ANALYSIS */}

            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-7">
              <div className="mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                  AI assistance
                </p>

                <h2 className="mt-2 text-xl font-semibold text-zinc-100">
                  Initial analysis
                </h2>

                <p className="mt-2 text-sm text-zinc-600">
                  Initial technical analysis generated from the issue report.
                </p>
              </div>

              {issue.aiAnalysis?.summary ? (
                <div>
                  <p className="text-base leading-7 text-zinc-300">
                    {issue.aiAnalysis.summary}
                  </p>

                  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                        Possible cause
                      </p>

                      <p className="mt-3 text-sm leading-6 text-zinc-400">
                        {issue.aiAnalysis
                          .possibleCause ||
                          "No cause identified."}
                      </p>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                        Suggested action
                      </p>

                      <p className="mt-3 text-sm leading-6 text-zinc-400">
                        {issue.aiAnalysis
                          .suggestedAction ||
                          "No action suggested."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                  <p className="text-sm text-zinc-600">
                    Initial AI analysis is not available.
                  </p>
                </div>
              )}
            </section>

            {/* RESOLUTION */}

            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-7">
              <div className="mb-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                  Resolution
                </p>

                <h2 className="mt-2 text-xl font-semibold text-zinc-100">
                  Document the fix
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Record the confirmed root cause, fix, and verification performed.
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
                rows={8}
                className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-4 text-sm leading-7 text-zinc-300 outline-none transition placeholder:text-zinc-700 focus:border-emerald-500/30 focus:bg-zinc-900"
              />
            </section>

            {/* SAVE BAR */}

            <div className="sticky bottom-5 z-20 flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-[#0d0d10]/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
              <div className="px-3">
                {saveMessage ? (
                  <p className="text-xs text-emerald-400">
                    {saveMessage}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-600">
                    {canResolve
                      ? "Investigation is ready to be resolved."
                      : `${steps.length - completedSteps} investigation step${
                          steps.length -
                            completedSteps ===
                          1
                            ? ""
                            : "s"
                        } remaining.`}
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
                  className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:opacity-40 sm:flex-none"
                >
                  {saving
                    ? "Saving..."
                    : "Save progress"}
                </button>

                <button
                  onClick={() =>
                    saveInvestigation("resolved")
                  }
                  disabled={
                    saving || !canResolve
                  }
                  className="flex-1 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-30 sm:flex-none"
                >
                  Mark resolved →
                </button>
              </div>
            </div>

            {/* ACTIVITY */}

            <ActivityTimeline
              key={`${issueId}-${activityRefresh}`}
              issueId={issueId}
            />
          </div>

          {/* RIGHT SIDEBAR */}

          <aside className="space-y-5">
            {/* ISSUE OVERVIEW */}

            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-6">
              <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                Issue overview
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

                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-700">
                    Created
                  </p>

                  <p className="text-sm text-zinc-300">
                    {formattedCreatedDate}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-700">
                    Updated
                  </p>

                  <p className="text-sm text-zinc-300">
                    {formattedUpdatedDate}
                  </p>
                </div>
              </div>
            </section>

            {/* AI CONFIDENCE */}

            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                  Initial AI confidence
                </p>

                <span className="h-2 w-2 rounded-full bg-blue-400" />
              </div>

              <div className="mt-6 flex items-end justify-between">
                <p className="text-4xl font-semibold tracking-tight text-zinc-100">
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
                    width: `${Math.min(
                      Math.max(confidence, 0),
                      100
                    )}%`,
                  }}
                />
              </div>

              <p className="mt-4 text-[11px] leading-5 text-zinc-700">
                Confidence reflects the evidence available when the initial analysis was generated.
              </p>
            </section>

            {/* TECHNICAL CONTEXT */}

            {issue.technicalContext && (
              <section className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950">
                <details>
                  <summary className="cursor-pointer list-none p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                          Evidence
                        </p>

                        <h3 className="mt-2 font-semibold text-zinc-200">
                          Technical context
                        </h3>
                      </div>

                      <span className="text-zinc-700">
                        +
                      </span>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-zinc-600">
                      Logs, stack traces, requests, and developer-provided context.
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

            {/* WORKFLOW STATE */}

            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-6">
              <div className="flex items-center gap-3">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    issue.status === "resolved"
                      ? "bg-emerald-400"
                      : issue.status ===
                        "investigating"
                      ? "bg-blue-400"
                      : "bg-zinc-500"
                  }`}
                />

                <div>
                  <p className="text-xs font-medium capitalize text-zinc-300">
                    {issue.status}
                  </p>

                  <p className="mt-1 text-[10px] text-zinc-700">
                    Current investigation state
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