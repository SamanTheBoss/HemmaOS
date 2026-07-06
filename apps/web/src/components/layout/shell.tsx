import type { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-24 pt-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
