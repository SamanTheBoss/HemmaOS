"use client";

import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n-context";

interface StatusHeaderProps {
  status: string;
}

export function StatusHeader({ status }: StatusHeaderProps) {
  const { t } = useI18n();
  const isHealthy = status === "HEALTHY";
  const isDegraded = status === "DEGRADED";

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border p-6",
        isHealthy && "bg-emerald-400/10 border-emerald-400/20 shadow-lg shadow-emerald-500/10",
        isDegraded && "bg-amber-400/10 border-amber-400/20 shadow-lg shadow-amber-500/10",
        !isHealthy && !isDegraded && "bg-red-400/10 border-red-400/20 shadow-lg shadow-red-500/10",
      )}
    >
      {isHealthy ? (
        <CheckCircle2 className="h-12 w-12 text-emerald-400 shrink-0" />
      ) : isDegraded ? (
        <AlertTriangle className="h-12 w-12 text-amber-400 shrink-0" />
      ) : (
        <XCircle className="h-12 w-12 text-red-400 shrink-0" />
      )}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          {isHealthy
            ? t("dashboard.healthy")
            : isDegraded
              ? t("dashboard.degraded")
              : t("dashboard.unhealthy")}
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {isHealthy
            ? t("dashboard.healthy.sub")
            : t("dashboard.degraded.sub")}
        </p>
      </div>
    </div>
  );
}
