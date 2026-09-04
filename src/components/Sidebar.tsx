"use client";

import Link from "next/link";
import {
  Activity,
  LayoutDashboard,
  PlusCircle,
  Settings,
  Bug,
} from "lucide-react";

const navigation = [
  {
    name: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Issues",
    href: "/issues",
    icon: Bug,
  },
  {
    name: "New Issue",
    href: "/new-issue",
    icon: PlusCircle,
  },
];

export default function Sidebar() {
  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-100">

      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
          <Activity size={20} />
        </div>

        <div>
          <h1 className="font-semibold tracking-tight">
            DevTraxe
          </h1>

          <p className="text-xs text-zinc-500">
            Issue Intelligence
          </p>
        </div>
      </div>


      <nav className="flex-1 px-3 py-4">

        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}

      </nav>


      <div className="border-t border-zinc-800 p-4">

        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white">
          <Settings size={18} />
          Settings
        </button>

      </div>

    </aside>
  );
}