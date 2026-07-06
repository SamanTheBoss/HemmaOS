"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Shell } from "@/components/layout/shell";

const PUBLIC_PATHS = ["/setup", "/login"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, setupComplete, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (loading) return;

    if (setupComplete === false) {
      // Setup not finished: always land on /setup, even from /login, so a
      // fresh box can never get stuck on the login form with no password yet.
      if (pathname !== "/setup") router.replace("/setup");
      return;
    }

    if (!token) {
      if (pathname !== "/login") router.replace("/login");
      return;
    }

    if (isPublicPage) {
      router.replace("/hem");
    }
  }, [loading, token, setupComplete, pathname, router, isPublicPage]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-base">
        <Loader2 className="h-8 w-8 animate-spin text-violet" />
      </div>
    );
  }

  // Public pages (setup/login) render without the Shell
  if (isPublicPage) {
    if (setupComplete === false || !token) return <>{children}</>;
    return null;
  }

  // Protected pages require auth and render inside the Shell
  if (!token || setupComplete === false) return null;

  return <Shell>{children}</Shell>;
}
