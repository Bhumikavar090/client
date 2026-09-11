"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface AIAnalysis {
  summary?: string;
  possibleCause?: string;
  suggestedAction?: string;
  investigationSteps?: string[];
  confidence?: number;
}

interface Issue {
  _id: string;
  title: string;
  description: string;
  technicalContext?: string;
  status: string;
  priority: string;
  category?: string;
  aiAnalysis?: AIAnalysis;
  createdAt: string;
}

export default function IssueDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const issueId = params.id as string;

  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/issues/${issueId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch issue");
        }

        const data = await response.json();

        setIssue(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load this issue.");
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [issueId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <div className="text-zinc-400">
          Loading investigation...
        </div>
      </main>
    );
  }

  if (error || !issue) {
    return (
      <main className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">
            {error || "Issue not found"}
          </p>

          <button
            onClick={() => router.push("/issues")}
            className="px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 transition"
          >
            Back to issues
          </button>
        </div>
      </main>
    );
  }

  const analysis = issue.aiAnalysis;

  const confidence = analysis?.confidence ?? 0;

  const confidenceLabel =
    confidence >= 80
      ? "High confidence"
      : confidence >= 60
      ? "Moderate confidence"
      : "Low confidence";

  const formattedDate = new Date(
    issue.createdAt
  ).toLocaleDateString();

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Back button */}

        <button
          onClick={() => router.push("/issues")}
          className="text-sm text-zinc-400 hover:text-white transition mb-8"
        >
          ← Back to issues
        </button>

        {/* Header */}

        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">

            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                issue.priority === "critical"
                  ? "border-red-500/30 bg-red-500/10 text-red-400"
                  : issue.priority === "high"
                  ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
                  : issue.priority === "medium"
                  ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                  : "border-zinc-700 bg-zinc-900 text-zinc-400"
              }`}
            >
              {issue.priority.toUpperCase()}
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {issue.status}
            </span>

            {issue.category && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {issue.category}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            {issue.title}
          </h1>

          <p className="text-zinc-400 max-w-4xl leading-7">
            {issue.description}
          </p>

          <p className="text-xs text-zinc-600 mt-4">
            Reported {formattedDate}
          </p>
        </div>

        {/* Main grid */}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">

          {/* Left */}

          <div className="space-y-8">

            {/* AI Investigation */}

            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  ✦
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    AI Investigation
                  </h2>

                  <p className="text-sm text-zinc-500">
                    Analysis generated from the reported evidence
                  </p>
                </div>
              </div>

              {!analysis?.summary ? (
                <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-950">
                  <p className="text-zinc-400">
                    AI analysis is not available yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">

                  {/* Summary */}

                  <div className="border border-zinc-800 rounded-2xl p-7 bg-zinc-950">
                    <p className="text-xs uppercase tracking-widest text-zinc-500 mb-4">
                      Analysis Summary
                    </p>

                    <p className="text-lg leading-8 text-zinc-200">
                      {analysis.summary}
                    </p>
                  </div>

                  {/* Cause + Action */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-950">
                      <div className="flex items-center gap-3 mb-5">
                        <span className="text-orange-400 text-xl">
                          !
                        </span>

                        <h3 className="font-semibold">
                          Possible Cause
                        </h3>
                      </div>

                      <p className="text-zinc-400 leading-8">
                        {analysis.possibleCause ||
                          "No possible cause was identified."}
                      </p>
                    </div>

                    <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-950">
                      <div className="flex items-center gap-3 mb-5">
                        <span className="text-yellow-400 text-xl">
                          ✦
                        </span>

                        <h3 className="font-semibold">
                          Suggested Action
                        </h3>
                      </div>

                      <p className="text-zinc-400 leading-8">
                        {analysis.suggestedAction ||
                          "No suggested action was generated."}
                      </p>
                    </div>
                  </div>

                  {/* Investigation Steps */}

                  <div className="border border-zinc-800 rounded-2xl p-7 bg-zinc-950">
                    <div className="mb-6">
                      <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
                        Investigation Workflow
                      </p>

                      <h3 className="text-xl font-semibold">
                        Recommended Investigation Steps
                      </h3>
                    </div>

                    {analysis.investigationSteps &&
                    analysis.investigationSteps.length > 0 ? (
                      <div className="space-y-4">
                        {analysis.investigationSteps.map(
                          (step, index) => (
                            <div
                              key={`${issue._id}-step-${index}`}
                              className="flex gap-4"
                            >
                              <div className="shrink-0 w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-semibold"
                              >
                                {index + 1}
                              </div>

                              <p className="text-zinc-400 leading-7 pt-1">
                                {step}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-zinc-500">
                        No investigation steps were generated.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Technical Evidence */}

            {issue.technicalContext && (
              <section className="border border-zinc-800 rounded-2xl bg-zinc-950 overflow-hidden">
                <details>
                  <summary className="cursor-pointer list-none px-7 py-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">
                        Developer Evidence
                      </p>

                      <h3 className="font-semibold">
                        Technical Context
                      </h3>
                    </div>

                    <span className="text-zinc-500 text-sm">
                      View evidence
                    </span>
                  </summary>

                  <div className="border-t border-zinc-800 p-7">
                    <pre className="whitespace-pre-wrap wrap-break-words text-sm leading-7 text-zinc-400 font-mono">
                      {issue.technicalContext}
                    </pre>
                  </div>
                </details>
              </section>
            )}
          </div>

          {/* Right sidebar */}

          <aside className="space-y-5">

            {/* Investigation details */}

            <div className="border border-zinc-800 rounded-2xl bg-zinc-950 p-7">
              <p className="text-xs uppercase tracking-widest text-zinc-500 mb-7">
                Investigation Details
              </p>

              <div className="pb-6 border-b border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
                  Category
                </p>

                <p className="text-lg font-medium">
                  {issue.category || "Unclassified"}
                </p>
              </div>

              <div className="py-6 border-b border-zinc-800">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
                      AI Confidence
                    </p>

                    <p className="text-4xl font-bold">
                      {confidence}%
                    </p>
                  </div>

                  <span className="text-xs text-zinc-500">
                    {confidenceLabel}
                  </span>
                </div>

                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{
                      width: `${confidence}%`,
                    }}
                  />
                </div>
              </div>

              <div className="pt-6">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
                  Reported
                </p>

                <p className="text-zinc-300">
                  {formattedDate}
                </p>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </main>
  );
}