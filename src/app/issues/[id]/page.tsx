"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ActivityTimeline from "@/components/ActivityTimeline";

/* =========================================================
   TYPES
========================================================= */

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
  status: "open" | "investigating" | "resolved" | string;
  priority: "low" | "medium" | "high" | "critical" | string;
  category?: string;
  project?: Project;
  aiAnalysis?: AIAnalysis;
  investigation?: Investigation;
  createdAt: string;
}

/* =========================================================
   CONSTANTS
========================================================= */

const API_BASE = "http://localhost:5000/api";

/* =========================================================
   PAGE
========================================================= */

export default function IssueDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const issueId = String(params.id);

  const [issue, setIssue] = useState<Issue | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingFindings, setSavingFindings] = useState(false);
  const [savingResolution, setSavingResolution] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const [activityRefresh, setActivityRefresh] = useState(0);

  /* =======================================================
     FETCH ISSUE
  ======================================================= */

  const fetchIssue = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/issues/${issueId}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch issue"
        );
      }

      /*
        Some APIs return the issue directly.
        Others return { success, issue }.
        Support both.
      */
      const fetchedIssue = data.issue || data;

      setIssue(fetchedIssue);
    } catch (err) {
      console.error("FETCH ISSUE ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load this investigation."
      );
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    fetchIssue();
  }, [fetchIssue]);

  /* =======================================================
     ACTIVITY LOGGER
  ======================================================= */

  const recordActivity = async (
    action: string,
    message: string,
    metadata: Record<string, unknown> = {}
  ) => {
    try {
      const response = await fetch(
        `${API_BASE}/issues/${issueId}/activity`,
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
        const data = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          data.message || "Failed to record activity"
        );
      }

      setActivityRefresh((value) => value + 1);
    } catch (err) {
      /*
        Activity failure should never make
        the actual investigation save fail.
      */
      console.warn(
        "Activity logging failed:",
        err
      );
    }
  };

  /* =======================================================
     UPDATE LOCAL ISSUE
  ======================================================= */

  const updateIssue = (
    updater: (current: Issue) => Issue
  ) => {
    setIssue((current) =>
      current ? updater(current) : current
    );
  };

  /* =======================================================
     TOGGLE INVESTIGATION STEP
  ======================================================= */

  const toggleStep = (index: number) => {
    updateIssue((current) => {
      const currentSteps =
        current.investigation?.steps || [];

      const updatedSteps = currentSteps.map(
        (step, stepIndex) =>
          stepIndex === index
            ? {
                ...step,
                completed: !step.completed,
              }
            : step
      );

      return {
        ...current,

        investigation: {
          steps: updatedSteps,

          findings:
            current.investigation?.findings || "",

          resolution:
            current.investigation?.resolution || "",
        },
      };
    });
  };

  /* =======================================================
     UPDATE FINDINGS
  ======================================================= */

  const updateFindings = (value: string) => {
    updateIssue((current) => ({
      ...current,

      investigation: {
        steps:
          current.investigation?.steps || [],

        findings: value,

        resolution:
          current.investigation?.resolution || "",
      },
    }));
  };

  /* =======================================================
     UPDATE RESOLUTION
  ======================================================= */

  const updateResolution = (value: string) => {
    updateIssue((current) => ({
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

  /* =======================================================
     SAVE FINDINGS
  ======================================================= */

  const saveFindings = async () => {
    if (!issue) return;

    const findings =
      issue.investigation?.findings?.trim() || "";

    if (!findings) {
      setError(
        "Please enter your investigation findings first."
      );
      return;
    }

    try {
      setSavingFindings(true);
      setError("");
      setSaveMessage("");

      const response = await fetch(
        `${API_BASE}/issues/${issueId}/findings`,
        {
          method: "PATCH",
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
          data.message || "Failed to save findings"
        );
      }

      if (data.issue) {
        setIssue(data.issue);
      }

      await recordActivity(
        "FINDING_ADDED",
        "Developer added investigation findings.",
        {
          source: "issue_workspace",
        }
      );

      setSaveMessage(
        "Investigation findings saved."
      );

      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    } catch (err) {
      console.error(
        "SAVE FINDINGS ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save findings."
      );
    } finally {
      setSavingFindings(false);
    }
  };

  /* =======================================================
     SAVE RESOLUTION
  ======================================================= */

  const saveResolution = async () => {
    if (!issue) return;

    const resolution =
      issue.investigation?.resolution?.trim() || "";

    if (!resolution) {
      setError(
        "Please enter the resolution first."
      );
      return;
    }

    try {
      setSavingResolution(true);
      setError("");
      setSaveMessage("");

      const response = await fetch(
        `${API_BASE}/issues/${issueId}/resolution`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resolution,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save resolution"
        );
      }

      if (data.issue) {
        setIssue(data.issue);
      }

      await recordActivity(
        "RESOLUTION_ADDED",
        "Developer added the issue resolution.",
        {
          source: "issue_workspace",
        }
      );

      setSaveMessage(
        "Resolution saved successfully."
      );

      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    } catch (err) {
      console.error(
        "SAVE RESOLUTION ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save resolution."
      );
    } finally {
      setSavingResolution(false);
    }
  };

  /* =======================================================
     UPDATE STATUS
  ======================================================= */

  const updateStatus = async (
    nextStatus: "open" | "investigating" | "resolved"
  ) => {
    if (!issue) return;

    const previousStatus = issue.status;

    try {
      setSavingStatus(true);
      setError("");
      setSaveMessage("");

      const response = await fetch(
        `${API_BASE}/issues/${issueId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update issue status"
        );
      }

      if (data.issue) {
        setIssue(data.issue);
      } else {
        updateIssue((current) => ({
          ...current,
          status: nextStatus,
        }));
      }

      if (
        previousStatus === "open" &&
        nextStatus === "investigating"
      ) {
        await recordActivity(
          "INVESTIGATION_STARTED",
          "Developer started investigating the issue.",
          {
            previousStatus,
            nextStatus,
          }
        );
      } else if (nextStatus === "resolved") {
        await recordActivity(
          "ISSUE_RESOLVED",
          "Issue was marked as resolved.",
          {
            previousStatus,
            nextStatus,
          }
        );
      } else {
        await recordActivity(
          "STATUS_CHANGED",
          `Issue status changed to ${nextStatus}.`,
          {
            previousStatus,
            nextStatus,
          }
        );
      }

      setSaveMessage(
        nextStatus === "resolved"
          ? "Issue resolved successfully."
          : "Investigation started."
      );

      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    } catch (err) {
      console.error(
        "UPDATE STATUS ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update status."
      );
    } finally {
      setSavingStatus(false);
    }
  };

  /* =======================================================
     SAVE ALL INVESTIGATION DATA
  ======================================================= */

  const saveProgress = async () => {
    if (!issue) return;

    const findings =
      issue.investigation?.findings?.trim() || "";

    const resolution =
      issue.investigation?.resolution?.trim() || "";

    try {
      setError("");
      setSaveMessage("");

      /*
        Save findings if present.
      */
      if (findings) {
        setSavingFindings(true);

        const findingsResponse = await fetch(
          `${API_BASE}/issues/${issueId}/findings`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              findings,
            }),
          }
        );

        const findingsData =
          await findingsResponse.json();

        if (!findingsResponse.ok) {
          throw new Error(
            findingsData.message ||
              "Failed to save findings"
          );
        }

        if (findingsData.issue) {
          setIssue(findingsData.issue);
        }

        setSavingFindings(false);
      }

      /*
        Save resolution if present.
      */
      if (resolution) {
        setSavingResolution(true);

        const resolutionResponse =
          await fetch(
            `${API_BASE}/issues/${issueId}/resolution`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                resolution,
              }),
            }
          );

        const resolutionData =
          await resolutionResponse.json();

        if (!resolutionResponse.ok) {
          throw new Error(
            resolutionData.message ||
              "Failed to save resolution"
          );
        }

        if (resolutionData.issue) {
          setIssue(resolutionData.issue);
        }

        setSavingResolution(false);
      }

      /*
        Move open issue into investigation.
      */
      if (issue.status === "open") {
        await updateStatus("investigating");
      }

      await recordActivity(
        "INVESTIGATION_UPDATED",
        "Developer saved investigation progress.",
        {
          completedSteps,
          totalSteps: steps.length,
        }
      );

      setSaveMessage(
        "Investigation progress saved."
      );

      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    } catch (err) {
      console.error(
        "SAVE PROGRESS ERROR:",
        err
      );

      setSavingFindings(false);
      setSavingResolution(false);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save investigation."
      );
    }
  };

  /* =======================================================
     RESOLVE ISSUE
  ======================================================= */

  const resolveIssue = async () => {
    if (!issue) return;

    const findings =
      issue.investigation?.findings?.trim() || "";

    const resolution =
      issue.investigation?.resolution?.trim() || "";

    if (!resolution) {
      setError(
        "Add the resolution before marking the issue as resolved."
      );
      return;
    }

    if (!findings) {
      setError(
        "Add investigation findings before resolving the issue."
      );
      return;
    }

    const allStepsCompleted =
      steps.length === 0 ||
      completedSteps === steps.length;

    if (!allStepsCompleted) {
      setError(
        "Complete all investigation steps before resolving the issue."
      );
      return;
    }

    try {
      setSavingStatus(true);
      setError("");
      setSaveMessage("");

      /*
        Save findings.
      */
      const findingsResponse = await fetch(
        `${API_BASE}/issues/${issueId}/findings`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            findings,
          }),
        }
      );

      const findingsData =
        await findingsResponse.json();

      if (!findingsResponse.ok) {
        throw new Error(
          findingsData.message ||
            "Failed to save findings"
        );
      }

      /*
        Save resolution.
      */
      const resolutionResponse =
        await fetch(
          `${API_BASE}/issues/${issueId}/resolution`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              resolution,
            }),
          }
        );

      const resolutionData =
        await resolutionResponse.json();

      if (!resolutionResponse.ok) {
        throw new Error(
          resolutionData.message ||
            "Failed to save resolution"
        );
      }

      /*
        Finally resolve.
      */
      const statusResponse = await fetch(
        `${API_BASE}/issues/${issueId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "resolved",
          }),
        }
      );

      const statusData =
        await statusResponse.json();

      if (!statusResponse.ok) {
        throw new Error(
          statusData.message ||
            "Failed to resolve issue"
        );
      }

      setIssue(
        statusData.issue ||
          resolutionData.issue ||
          findingsData.issue
      );

      await recordActivity(
        "ISSUE_RESOLVED",
        "Issue was marked as resolved.",
        {
          source: "issue_workspace",
        }
      );

      setSaveMessage(
        "Issue resolved successfully."
      );
    } catch (err) {
      console.error(
        "RESOLVE ISSUE ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to resolve issue."
      );
    } finally {
      setSavingStatus(false);
    }
  };

  /* =======================================================
     DERIVED VALUES
  ======================================================= */

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

  const isResolved =
    issue?.status === "resolved";

  const isSaving =
    savingFindings ||
    savingResolution ||
    savingStatus;

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#09090b] p-6 text-white">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="mb-8 h-4 w-32 rounded bg-zinc-900" />

          <div className="h-10 w-2/3 rounded bg-zinc-900" />

          <div className="mt-3 h-5 w-1/2 rounded bg-zinc-900" />

          <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
            <div className="space-y-6">
              <div className="h-72 rounded-2xl border border-zinc-800 bg-zinc-950" />

              <div className="h-96 rounded-2xl border border-zinc-800 bg-zinc-950" />

              <div className="h-72 rounded-2xl border border-zinc-800 bg-zinc-950" />
            </div>

            <div className="space-y-5">
              <div className="h-40 rounded-2xl border border-zinc-800 bg-zinc-950" />

              <div className="h-72 rounded-2xl border border-zinc-800 bg-zinc-950" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error && !issue) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-6 text-white">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            !
          </div>

          <h1 className="text-lg font-semibold">
            Investigation unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {error}
          </p>

          <button
            onClick={() => router.push("/issues")}
            className="mt-6 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            Back to issues
          </button>
        </div>
      </main>
    );
  }

  if (!issue) return null;

  /* =======================================================
     DATE
  ======================================================= */

  const formattedDate = new Date(
    issue.createdAt
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* =================================================
            TOP NAV
        ================================================= */}

        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.push("/issues")}
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

        {/* =================================================
            ISSUE HEADER
        ================================================= */}

        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">

            {/* PRIORITY */}

            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                issue.priority === "critical"
                  ? "border-red-500/20 bg-red-500/5 text-red-400"
                  : issue.priority === "high"
                  ? "border-orange-500/20 bg-orange-500/5 text-orange-400"
                  : issue.priority === "medium"
                  ? "border-yellow-500/20 bg-yellow-500/5 text-yellow-400"
                  : "border-zinc-800 bg-zinc-900 text-zinc-500"
              }`}
            >
              {issue.priority}
            </span>

            {/* STATUS */}

            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${
                issue.status === "resolved"
                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                  : issue.status === "investigating"
                  ? "border-blue-500/20 bg-blue-500/5 text-blue-400"
                  : "border-purple-500/20 bg-purple-500/5 text-purple-400"
              }`}
            >
              {issue.status}
            </span>

            {/* CATEGORY */}

            {issue.category && (
              <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                {issue.category}
              </span>
            )}

            {/* PROJECT */}

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

        {/* =================================================
            ERROR / SUCCESS MESSAGES
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-xs leading-5 text-red-400">
              {error}
            </p>

            <button
              onClick={() => setError("")}
              className="text-zinc-600 transition hover:text-white"
            >
              ×
            </button>
          </div>
        )}

        {saveMessage && (
          <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
            <p className="text-xs text-emerald-400">
              ✓ {saveMessage}
            </p>
          </div>
        )}

        {/* =================================================
            MAIN WORKSPACE
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">

          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div className="space-y-6">

            {/* =================================================
                AI ANALYSIS
            ================================================= */}

            <section className="relative overflow-hidden rounded-2xl border border-blue-500/15 bg-blue-500/[0.025]">

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
                      AI-generated engineering analysis
                    </p>
                  </div>
                </div>

                {issue.aiAnalysis?.summary ? (
                  <>
                    <p className="text-lg leading-8 text-zinc-200">
                      {issue.aiAnalysis.summary}
                    </p>

                    <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">

                      {/* CAUSE */}

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

                      {/* ACTION */}

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
                  </>
                ) : (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
                    <p className="text-sm text-zinc-600">
                      AI analysis is not available yet.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* =================================================
                INVESTIGATION CHECKLIST
            ================================================= */}

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
                      Follow the recommended debugging path.
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
                  steps.map((step, index) => (
                    <button
                      key={`${issue._id}-${index}`}
                      type="button"
                      disabled={isResolved}
                      onClick={() => toggleStep(index)}
                      className={`group flex w-full items-start gap-4 rounded-xl p-4 text-left transition ${
                        step.completed
                          ? "bg-emerald-500/[0.025]"
                          : "hover:bg-zinc-900/70"
                      } ${
                        isResolved
                          ? "cursor-default"
                          : ""
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
                  ))
                )}
              </div>
            </section>

            {/* =================================================
                FINDINGS
            ================================================= */}

            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-7">

              <div className="mb-5 flex items-start justify-between gap-4">

                <div>
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

                <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-[10px] uppercase tracking-wider text-zinc-600">
                  Evidence
                </div>
              </div>

              <textarea
                value={
                  issue.investigation?.findings || ""
                }
                onChange={(event) =>
                  updateFindings(
                    event.target.value
                  )
                }
                disabled={isResolved}
                placeholder="Document logs, measurements, experiments, confirmed causes or rejected hypotheses..."
                rows={7}
                className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-4 text-sm leading-7 text-zinc-300 outline-none transition placeholder:text-zinc-700 focus:border-blue-500/40 focus:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <div className="mt-4 flex items-center justify-between">

                <p className="text-[10px] text-zinc-700">
                  {issue.investigation?.findings?.length || 0} characters
                </p>

                <button
                  type="button"
                  onClick={saveFindings}
                  disabled={
                    isSaving ||
                    isResolved ||
                    !issue.investigation?.findings?.trim()
                  }
                  className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/15 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {savingFindings
                    ? "Saving..."
                    : "Save findings"}
                </button>
              </div>
            </section>

            {/* =================================================
                RESOLUTION
            ================================================= */}

            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-7">

              <div className="mb-5 flex items-start justify-between gap-4">

                <div>
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
                    Record the confirmed root cause and solution.
                  </p>
                </div>

                {isResolved && (
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                    Resolved
                  </span>
                )}
              </div>

              <textarea
                value={
                  issue.investigation?.resolution || ""
                }
                onChange={(event) =>
                  updateResolution(
                    event.target.value
                  )
                }
                disabled={isResolved}
                placeholder="What caused the issue? What changed? How was the fix verified?"
                rows={7}
                className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-4 text-sm leading-7 text-zinc-300 outline-none transition placeholder:text-zinc-700 focus:border-emerald-500/30 focus:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <div className="mt-4 flex items-center justify-between">

                <p className="text-[10px] text-zinc-700">
                  {issue.investigation?.resolution?.length || 0} characters
                </p>

                <button
                  type="button"
                  onClick={saveResolution}
                  disabled={
                    isSaving ||
                    isResolved ||
                    !issue.investigation?.resolution?.trim()
                  }
                  className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {savingResolution
                    ? "Saving..."
                    : "Save resolution"}
                </button>
              </div>
            </section>

            {/* =================================================
                ACTION BAR
            ================================================= */}

            {!isResolved && (
              <div className="sticky bottom-5 z-20 flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-[#0d0d10]/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">

                <div className="px-3">
                  <p className="hidden text-xs text-zinc-600 sm:block">
                    Save your investigation progress.
                  </p>
                </div>

                <div className="flex gap-2">

                  <button
                    type="button"
                    onClick={saveProgress}
                    disabled={isSaving}
                    className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                  >
                    {isSaving
                      ? "Saving..."
                      : "Save progress"}
                  </button>

                  <button
                    type="button"
                    onClick={resolveIssue}
                    disabled={
                      isSaving ||
                      !canResolve
                    }
                    className="flex-1 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-30 sm:flex-none"
                  >
                    {savingStatus
                      ? "Resolving..."
                      : "Mark resolved →"}
                  </button>
                </div>
              </div>
            )}

            {/* =================================================
                RESOLVED BANNER
            ================================================= */}

            {isResolved && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.025] p-6">

                <div className="flex items-center gap-4">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    ✓
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-emerald-400">
                      Investigation resolved
                    </h3>

                    <p className="mt-1 text-xs text-zinc-600">
                      The issue has been documented and marked as resolved.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                ACTIVITY TIMELINE
            ================================================= */}

            <ActivityTimeline
              key={`${issueId}-${activityRefresh}`}
              issueId={issueId}
            />
          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="space-y-5">

            {/* =================================================
                AI CONFIDENCE
            ================================================= */}

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
                    width: `${Math.min(
                      Math.max(confidence, 0),
                      100
                    )}%`,
                  }}
                />
              </div>
            </section>

            {/* =================================================
                ISSUE DETAILS
            ================================================= */}

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

                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-700">
                    Issue ID
                  </p>

                  <p className="break-all font-mono text-[10px] text-zinc-600">
                    {issue._id}
                  </p>
                </div>
              </div>
            </section>

            {/* =================================================
                TECHNICAL CONTEXT
            ================================================= */}

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

                    <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-black/40 p-4 font-mono text-[11px] leading-6 text-zinc-500">
                      {issue.technicalContext}
                    </pre>
                  </div>
                </details>
              </section>
            )}

            {/* =================================================
                WORKFLOW STATUS
            ================================================= */}

            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-6">

              <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                Workflow
              </p>

              <div className="space-y-4">

                {/* OPEN */}

                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      issue.status === "open"
                        ? "bg-purple-400"
                        : "bg-zinc-800"
                    }`}
                  />

                  <span
                    className={`text-xs ${
                      issue.status === "open"
                        ? "text-zinc-200"
                        : "text-zinc-700"
                    }`}
                  >
                    Issue reported
                  </span>
                </div>

                <div className="ml-1 h-5 w-px bg-zinc-800" />

                {/* INVESTIGATING */}

                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      issue.status === "investigating"
                        ? "bg-blue-400"
                        : issue.status === "resolved"
                        ? "bg-emerald-400"
                        : "bg-zinc-800"
                    }`}
                  />

                  <span
                    className={`text-xs ${
                      issue.status === "investigating"
                        ? "text-zinc-200"
                        : issue.status === "resolved"
                        ? "text-zinc-500"
                        : "text-zinc-700"
                    }`}
                  >
                    Investigation
                  </span>
                </div>

                <div className="ml-1 h-5 w-px bg-zinc-800" />

                {/* RESOLVED */}

                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full ${
                      issue.status === "resolved"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-zinc-900 text-zinc-700"
                    }`}
                  >
                    {issue.status === "resolved"
                      ? "✓"
                      : ""}
                  </div>

                  <span
                    className={`text-xs ${
                      issue.status === "resolved"
                        ? "text-emerald-400"
                        : "text-zinc-700"
                    }`}
                  >
                    Resolved
                  </span>
                </div>
              </div>
            </section>

          </aside>
        </div>
      </div>
    </main>
  );
}