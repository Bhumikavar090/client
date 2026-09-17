"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "../lib/auth";

const PUBLIC_ROUTES = [
  "/login",
  "/register",
];

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const isPublicRoute = PUBLIC_ROUTES.some(
      (route) =>
        pathname === route ||
        pathname.startsWith(`${route}/`)
    );

    if (isPublicRoute) {
      setChecking(false);
      return;
    }

    const token = auth.getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setChecking(false);
  }, [pathname, router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-sm text-gray-400">
          Loading DevTrace...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}