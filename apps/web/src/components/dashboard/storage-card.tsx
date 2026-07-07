"use client";

import { HardDrive, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n-context";
import type { Locale } from "@/lib/i18n";

interface StorageCardProps {
  total: string;
  used: string;
  percent: number;
}

function estimateYears(percentUsed: number, locale: Locale): string {
  const sv = locale === "sv";
  if (percentUsed <= 0) return sv ? "mycket lång tid" : "a very long time";
  const yearsLeft = Math.round((100 - percentUsed) / percentUsed * 1);
  if (yearsLeft >= 10) return sv ? "över 10 år" : "over 10 years";
  if (yearsLeft <= 0) return sv ? "lite" : "a little while";
  return sv ? `ca ${yearsLeft} år` : `about ${yearsLeft} years`;
}

export function StorageCard({ total, used, percent }: StorageCardProps) {
  const { t, locale } = useI18n();
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-blue-500/20">
            <HardDrive className="h-5 w-5 text-white" />
          </div>
          <CardTitle>{t("dashboard.storage")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={percent} className="mb-3" />
        <p className="text-sm font-medium text-slate-300">
          {t("dashboard.storage.used", { used, total })}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {t("dashboard.storage.estimate", {
            years: estimateYears(percent, locale),
          })}
        </p>
        {percent >= 85 && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-400/10 border border-amber-400/20 p-3">
            <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-200/90">
              {t("dashboard.storage.warning")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
