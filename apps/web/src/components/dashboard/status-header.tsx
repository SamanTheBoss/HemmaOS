"use client";

import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusHeaderProps {
  status: string;
}

export function StatusHeader({ status }: StatusHeaderProps) {
  const isHealthy = status === "HEALTHY";
  const isDegraded = status === "DEGRADED";

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl p-6 shadow-sm",
        isHealthy && "bg-green-50 border border-green-100",
        isDegraded && "bg-yellow-50 border border-yellow-100",
        !isHealthy && !isDegraded && "bg-red-50 border border-red-100",
      )}
    >
      {isHealthy ? (
        <CheckCircle2 className="h-12 w-12 text-green-500 shrink-0" />
      ) : isDegraded ? (
        <AlertTriangle className="h-12 w-12 text-yellow-500 shrink-0" />
      ) : (
        <XCircle className="h-12 w-12 text-red-500 shrink-0" />
      )}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {isHealthy
            ? "Ditt hem är säkrat"
            : isDegraded
              ? "Något behöver uppmärksamhet"
              : "Systemet har problem"}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {isHealthy
            ? "Alla tjänster körs som de ska."
            : "Kontrollera inställningarna."}
        </p>
      </div>
    </div>
  );
}
