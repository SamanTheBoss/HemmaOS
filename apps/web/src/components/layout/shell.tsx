import type { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 flex min-h-dvh flex-col">
      <main className="view-in mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6 pb-28 pt-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
