"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const navigation = [
    {
      name: "Overview",
      href: "/",
      icon: "⌂",
    },
    {
      name: "Issues",
      href: "/issues",
      icon: "◇",
    },
    {
      name: "Projects",
      href: "/projects",
      icon: "□",
    },
  ];

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);

  return (
    <>
      {/* DESKTOP SIDEBAR */}

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-62.5 border-r border-zinc-800/80 bg-[#0b0b0d] lg:flex lg:flex-col">

        <SidebarContent
          navigation={navigation}
          isActive={isActive}
        />

      </aside>


      {/* MOBILE HEADER */}

      <div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-800/80 bg-[#0b0b0d]/95 px-5 backdrop-blur-xl lg:hidden">

        <Link
          href="/"
          onClick={() =>
            setMobileOpen(false)
          }
          className="flex items-center gap-3"
        >

          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-sm text-blue-400">
            ✦
          </div>

          <div>

            <p className="text-sm font-semibold tracking-tight text-white">
              DevTrace
            </p>

            <p className="text-[8px] uppercase tracking-[0.2em] text-zinc-600">
              AI Engineering
            </p>

          </div>

        </Link>


        <button
          onClick={() =>
            setMobileOpen(
              !mobileOpen
            )
          }
          aria-label="Toggle navigation"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 transition hover:text-white"
        >
          {mobileOpen ? "×" : "☰"}
        </button>

      </div>


      {/* MOBILE DRAWER */}

      {mobileOpen && (
        <>

          <button
            aria-label="Close navigation"
            onClick={() =>
              setMobileOpen(false)
            }
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />

          <aside className="fixed bottom-0 left-0 top-16 z-50 w-70 border-r border-zinc-800/80 bg-[#0b0b0d] lg:hidden">

            <SidebarContent
              navigation={navigation}
              isActive={isActive}
              onNavigate={() =>
                setMobileOpen(false)
              }
            />

          </aside>

        </>
      )}
    </>
  );
}


interface NavigationItem {
  name: string;
  href: string;
  icon: string;
}

function SidebarContent({
  navigation,
  isActive,
  onNavigate,
}: {
  navigation: NavigationItem[];
  isActive: (href: string) => boolean;
  onNavigate?: () => void;
}) {
  return (
    <>

      {/* BRAND - DESKTOP */}

      <div className="hidden h-19 items-center border-b border-zinc-800/80 px-6 lg:flex">

        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3"
        >

          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
            ✦
          </div>

          <div>

            <p className="text-sm font-semibold tracking-tight text-white">
              DevTrace
            </p>

            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
              AI Engineering
            </p>

          </div>

        </Link>

      </div>


      {/* NAVIGATION */}

      <div className="flex h-full flex-col px-4 py-6">

        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
          Workspace
        </p>

        <nav className="space-y-1">

          {navigation.map((item) => {
            const active = isActive(
              item.href
            );

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
                }`}
              >

                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm ${
                    active
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-zinc-900 text-zinc-600 group-hover:text-zinc-300"
                  }`}
                >
                  {item.icon}
                </span>

                <span>
                  {item.name}
                </span>

              </Link>
            );
          })}

        </nav>


        {/* AI ENGINE */}

        <div className="mt-10">

          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
            Intelligence
          </p>

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-4">

            <div className="flex items-center gap-3">

              <div className="relative">

                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40" />

              </div>

              <div>

                <p className="text-xs font-medium text-zinc-300">
                  AI Engine
                </p>

                <p className="text-[11px] text-emerald-400">
                  Operational
                </p>

              </div>

            </div>

            <div className="mt-4 border-t border-zinc-800 pt-3">

              <p className="text-[11px] leading-5 text-zinc-600">
                Gemini-powered issue analysis and
                investigation workflows.
              </p>

            </div>

          </div>

        </div>


        {/* USER */}

        <div className="mt-auto border-t border-zinc-800/80 pt-4">

          <div className="flex items-center gap-3 rounded-xl bg-zinc-950 px-3 py-3">

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-400">
              D
            </div>

            <div className="min-w-0">

              <p className="truncate text-xs font-medium text-zinc-300">
                Developer Workspace
              </p>

              <p className="text-[10px] text-zinc-600">
                Local environment
              </p>

            </div>

          </div>

        </div>

      </div>

    </>
  );
}