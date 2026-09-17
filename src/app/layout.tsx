"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";

import "./globals.css";

import Sidebar from "../components/Sidebar";
import StartupScreen from "../components/StartupScreen";
import AuthGuard from "../components/AuthGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const [showStartup, setShowStartup] = useState(true);

  const handleStartupComplete = useCallback(() => {
    setShowStartup(false);
  }, []);

  const isPublicRoute =
    pathname === "/login" ||
    pathname === "/register";

  return (
    <html lang="en">
      <body>
        {isPublicRoute ? (
          children
        ) : (
          <AuthGuard>
            {showStartup && (
              <StartupScreen
                onComplete={handleStartupComplete}
              />
            )}

            <Sidebar />

            <div className="lg:pl-62.5">
              {children}
            </div>
          </AuthGuard>
        )}
      </body>
    </html>
  );
}