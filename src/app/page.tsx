import Link from "next/link";
import Sidebar from "../components/Sidebar";
import IssueCard from "../components/IssueCard";

const issues = [
  {
    title: "Users randomly getting logged out",
    description:
      "Multiple users are being logged out after updating their profile information.",
    priority: "high",
    status: "investigating",
  },
  {
    title: "Payment webhook processing delay",
    description:
      "Payment confirmation events are taking significantly longer than expected.",
    priority: "medium",
    status: "open",
  },
  {
    title: "API returning 500 errors",
    description:
      "The authentication API intermittently returns internal server errors.",
    priority: "critical",
    status: "investigating",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />

      <main className="flex-1 p-8 lg:p-12">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-500">
              Workspace
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
              Issue Overview
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Monitor, investigate and understand software issues.
            </p>
          </div>

          <Link
            href="/new-issue"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            + Report Issue
          </Link>
        </div>

        <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-sm text-zinc-500">
              Total Issues
            </p>

            <p className="mt-3 text-3xl font-semibold text-white">
              24
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-sm text-zinc-500">
              Investigating
            </p>

            <p className="mt-3 text-3xl font-semibold text-blue-400">
              8
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-sm text-zinc-500">
              Critical
            </p>

            <p className="mt-3 text-3xl font-semibold text-red-400">
              3
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-sm text-zinc-500">
              AI Confidence
            </p>

            <p className="mt-3 text-3xl font-semibold text-emerald-400">
              87%
            </p>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">
              Recent Issues
            </h2>

            <Link
              href="/issues"
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              View all
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {issues.map((issue) => (
              <IssueCard
                key={issue.title}
                {...issue}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}