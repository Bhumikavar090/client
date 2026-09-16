"use client";

import { useEffect, useState } from "react";

interface StartupScreenProps {
  onComplete: () => void;
}

export default function StartupScreen({
  onComplete,
}: StartupScreenProps) {
  const [phase, setPhase] = useState<
    "boot" | "exit"
  >("boot");

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setPhase("exit");
    }, 1800);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2350);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center overflow-hidden bg-[#050506] ${
        phase === "exit"
          ? "startup-exit"
          : ""
      }`}
    >

      {/* BACKGROUND GLOW */}

      <div className="pointer-events-none absolute inset-0">

        <div className="startup-glow startup-glow-one" />

        <div className="startup-glow startup-glow-two" />

        <div className="startup-grid" />

      </div>


      {/* CENTER */}

      <div
        className={`relative flex flex-col items-center ${
          phase === "exit"
            ? "startup-content-exit"
            : ""
        }`}
      >

        {/* LOGO */}

        <div className="startup-logo">

          <div className="startup-logo-ring" />

          <div className="startup-logo-inner">
            ✦
          </div>

        </div>


        {/* BRAND */}

        <div className="mt-7 overflow-hidden">

          <h1 className="startup-title">
            DEVTRAXE
          </h1>

        </div>


        {/* AI */}

        <div className="mt-1 overflow-hidden">

          <p className="startup-ai">
            AI
          </p>

        </div>


        {/* TAGLINE */}

        <div className="mt-7 overflow-hidden">

          <p className="startup-tagline">
            SOFTWARE INVESTIGATION ENGINE
          </p>

        </div>


        {/* LOADING */}

        <div className="mt-8 flex w-56 flex-col items-center">

          <div className="h-0.5 w-full overflow-hidden rounded-full bg-zinc-900">

            <div className="startup-progress" />

          </div>

          <div className="mt-3 flex w-full items-center justify-between">

            <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-700">
              Initializing
            </span>

            <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-700">
              v1.0
            </span>

          </div>

        </div>

      </div>


      {/* CORNER STATUS */}

      <div className="absolute bottom-8 left-0 right-0 flex justify-center">

        <div className="flex items-center gap-2 startup-status">

          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

          <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-700">
            AI Engine Loading
          </span>

        </div>

      </div>

    </div>
  );
}