"use client";

import { useState } from "react";

interface AIResult {
  rootCause?: string;
  evidenceAssessment?: string;
  nextAction?: string;
  resolutionConfidence?: number;
  sufficientEvidence?: boolean;
}

interface FindingFormProps {
  issueId: string;
  initialFindings?: string;
  onAnalysisComplete?: (result: AIResult) => void;
}

export default function FindingForm({
  issueId,
  initialFindings = "",
  onAnalysisComplete,
}: FindingFormProps) {
  const [findings, setFindings] = useState(initialFindings);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const analyzeFindings = async () => {
    if (!findings.trim()) {
      setError("Please enter your investigation findings first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/issues/${issueId}/analyze-findings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            findings: findings.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to analyze findings."
        );
      }

      setMessage("Findings analyzed successfully.");

      if (data.analysis) {
        onAnalysisComplete?.(data.analysis);
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to analyze findings."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-7">
      <div className="mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
          AI-assisted debugging
        </p>

        <h2 className="mt-2 text-xl font-semibold text-zinc-100">
          Analyze developer findings
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Add what you discovered while debugging. Gemini will compare
          your evidence with the previous analysis.
        </p>
      </div>

      <textarea
        value={findings}
        onChange={(event) => {
          setFindings(event.target.value);
          setError("");
          setMessage("");
        }}
        placeholder="Document logs, API responses, database checks, experiments, rejected hypotheses, or confirmed behavior..."
        rows={8}
        disabled={loading}
        className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-4 text-sm leading-7 text-zinc-300 outline-none transition placeholder:text-zinc-700 focus:border-blue-500/40 focus:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-5">
          {error && (
            <p className="text-xs text-red-400">
              {error}
            </p>
          )}

          {message && (
            <p className="text-xs text-emerald-400">
              {message}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={analyzeFindings}
          disabled={loading || !findings.trim()}
          className="rounded-xl bg-blue-500 px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Analyzing..." : "Analyze findings →"}
        </button>
      </div>
    </section>
  );
}