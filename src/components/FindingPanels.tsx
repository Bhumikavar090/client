"use client";

import { useState } from "react";
import FindingCard from "./FindingCard";

interface Finding {
  title: string;
  type:
    | "OBSERVATION"
    | "API_RESPONSE"
    | "LOG"
    | "CODE_REFERENCE"
    | "DATABASE"
    | "NOTE";
  description: string;
  evidence: string;
  createdAt: string;
}

interface FindingPanelProps {
  findings: Finding[];
  onAdd?: (finding: Finding) => void;
}

const TYPES: Finding["type"][] = [
  "OBSERVATION",
  "API_RESPONSE",
  "LOG",
  "CODE_REFERENCE",
  "DATABASE",
  "NOTE",
];

export default function FindingPanel({
  findings,
  onAdd,
}: FindingPanelProps) {
  const [title, setTitle] = useState("");
  const [type, setType] =
    useState<Finding["type"]>("OBSERVATION");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState("");

  const addFinding = () => {
    if (!title.trim() || !description.trim()) {
      return;
    }

    const finding: Finding = {
      title: title.trim(),
      type,
      description: description.trim(),
      evidence: evidence.trim(),
      createdAt: new Date().toISOString(),
    };

    onAdd?.(finding);

    setTitle("");
    setDescription("");
    setEvidence("");
    setType("OBSERVATION");
  };

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-7">
      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
          Evidence collection
        </p>

        <h2 className="mt-2 text-xl font-semibold text-zinc-100">
          Investigation findings
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Record individual pieces of evidence discovered during
          debugging.
        </p>
      </div>

      <div className="space-y-4">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Finding title"
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-blue-500/40"
        />

        <select
          value={type}
          onChange={(event) =>
            setType(event.target.value as Finding["type"])
          }
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-300 outline-none focus:border-blue-500/40"
        >
          {TYPES.map((item) => (
            <option key={item} value={item}>
              {item.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        <textarea
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          placeholder="What did you discover?"
          rows={4}
          className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm leading-6 text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-blue-500/40"
        />

        <textarea
          value={evidence}
          onChange={(event) =>
            setEvidence(event.target.value)
          }
          placeholder="Paste relevant log, API response, query result, stack trace, or other evidence..."
          rows={5}
          className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 font-mono text-xs leading-6 text-zinc-400 outline-none placeholder:text-zinc-700 focus:border-blue-500/40"
        />

        <button
          type="button"
          onClick={addFinding}
          disabled={!title.trim() || !description.trim()}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          + Add finding
        </button>
      </div>

      {findings.length > 0 && (
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              Recorded findings
            </p>

            <span className="text-[10px] text-zinc-700">
              {findings.length}{" "}
              {findings.length === 1 ? "finding" : "findings"}
            </span>
          </div>

          {findings.map((finding, index) => (
            <FindingCard
              key={`${finding.createdAt}-${index}`}
              finding={finding}
            />
          ))}
        </div>
      )}
    </section>
  );
}