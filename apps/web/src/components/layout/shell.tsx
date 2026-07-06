import type { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 flex min-h-dvh flex-col bg-base">
      <main className="view-in mx-auto w-full max-w-md flex-1 px-4 pb-24 pt-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
