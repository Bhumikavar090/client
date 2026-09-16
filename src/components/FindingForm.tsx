"use client";

import { FormEvent, useState } from "react";

interface Finding {
  id: string;
  type: string;
  title: string;
  description: string;
  evidence?: string;
  createdAt: string;
}

interface FindingFormProps {
  onAdd: (finding: Finding) => void;
  onCancel?: () => void;
}

const findingTypes = [
  ["OBSERVATION", "Observation"],
  ["API_RESPONSE", "API Response"],
  ["LOG", "Log"],
  ["CODE_REFERENCE", "Code Reference"],
  ["DATABASE", "Database"],
  ["NOTE", "Developer Note"],
];

export default function FindingForm({
  onAdd,
  onCancel,
}: FindingFormProps) {
  const [type, setType] = useState("OBSERVATION");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!title.trim() || !description.trim()) {
      return;
    }

    const finding: Finding = {
      id: crypto.randomUUID(),
      type,
      title: title.trim(),
      description: description.trim(),
      evidence: evidence.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onAdd(finding);

    setTitle("");
    setDescription("");
    setEvidence("");
    setType("OBSERVATION");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
    >
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-widest text-blue-400">
          Developer Evidence
        </p>

        <h2 className="mt-2 text-lg font-semibold text-white">
          Add Investigation Finding
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Record something you discovered while investigating the issue.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-400">
            Finding type
          </label>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
          >
            {findingTypes.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-400">
            Title
          </label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Profile endpoint returns 500"
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-400">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe what you discovered..."
            className="w-full resize-none rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-700 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-400">
            Evidence
            <span className="ml-2 text-zinc-700">
              optional
            </span>
          </label>

          <textarea
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            rows={5}
            placeholder={`Paste logs, API response, code snippet, query result, etc.`}
            className="w-full resize-none rounded-xl border border-zinc-800 bg-black px-4 py-3 font-mono text-xs leading-5 text-zinc-400 outline-none placeholder:text-zinc-700 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-zinc-800 px-4 py-2.5 text-sm text-zinc-400 transition hover:border-zinc-700 hover:text-white"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Add Finding
          </button>
        </div>
      </div>
    </form>
  );
}