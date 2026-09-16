"use client";

import { useState } from "react";
import FindingCard from "./FindingCard";
import FindingForm from "./FindingForm";

interface Finding {
  id: string;
  type: string;
  title: string;
  description: string;
  evidence?: string;
  createdAt: string;
}

interface FindingsPanelProps {
  initialFindings?: Finding[];
  onChange?: (findings: Finding[]) => void;
}

export default function FindingsPanel({
  initialFindings = [],
  onChange,
}: FindingsPanelProps) {
  const [findings, setFindings] =
    useState<Finding[]>(initialFindings);

  const [showForm, setShowForm] = useState(false);

  function addFinding(finding: Finding) {
    const updated = [finding, ...findings];

    setFindings(updated);
    onChange?.(updated);
    setShowForm(false);
  }

  function deleteFinding(id: string) {
    const updated = findings.filter(
      (finding) => finding.id !== id
    );

    setFindings(updated);
    onChange?.(updated);
  }

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-600">
            Investigation
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            Findings
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Evidence discovered during investigation.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:border-zinc-500 hover:bg-zinc-800"
          >
            + Add Finding
          </button>
        )}
      </div>

      {showForm && (
        <FindingForm
          onAdd={addFinding}
          onCancel={() => setShowForm(false)}
        />
      )}

      {!showForm && findings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            +
          </div>

          <h3 className="mt-4 text-sm font-medium text-zinc-300">
            No findings yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-zinc-600">
            Record logs, API responses, code references,
            database results and observations as you investigate.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {findings.map((finding) => (
          <FindingCard
            key={finding.id}
            finding={finding}
            onDelete={deleteFinding}
          />
        ))}
      </div>
    </section>
  );
}