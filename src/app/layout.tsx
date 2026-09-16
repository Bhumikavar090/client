"use client";

import { useCallback, useState } from "react";

import type { Metadata } from "next";

import "./globals.css";

import Sidebar from "../components/Sidebar";
import StartupScreen from "../components/StartupScreen";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showStartup, setShowStartup] =
    useState(true);

  const handleStartupComplete =
    useCallback(() => {
      setShowStartup(false);
    }, []);

  return (
    <html lang="en">
      <body>

        {showStartup && (
          <StartupScreen
            onComplete={
              handleStartupComplete
            }
          />
        )}

        <Sidebar />

        <div className="lg:pl-62.5">
          {children}
        </div>

      </body>
    </html>
  );
}