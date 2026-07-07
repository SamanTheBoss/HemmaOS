"use client";

import { useState } from "react";
import { HardDrive, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";

type Disk = { device: string; status: "healthy" | "failing" | "unknown" };

export function DiskHealth() {
  const { t } = useI18n();
  const [disks, setDisks] = useState<Disk[] | null>(null);
  const [checking, setChecking] = useState(false);

  async function check() {
    setChecking(true);
    try {
      const res = await api.getDiskHealth();
      setDisks(res.disks);
    } catch {
      setDisks([]);
    } finally {
      setChecking(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 shadow-lg shadow-black/20">
            <HardDrive className="h-5 w-5 text-white" />
          </div>
          <CardTitle>{t("settings.diskhealth")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-400">{t("settings.diskhealth.desc")}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={check}
            disabled={checking}
            className="shrink-0"
          >
            {checking
              ? t("settings.diskhealth.checking")
              : t("settings.diskhealth.check")}
          </Button>
        </div>

        {disks && disks.length === 0 && (
          <p className="text-xs text-slate-500">{t("settings.diskhealth.none")}</p>
        )}

        {disks && disks.length > 0 && (
          <div className="space-y-2">
            {disks.map((d) => (
              <div
                key={d.device}
                className="flex items-center justify-between rounded-xl border border-line bg-white/[.02] p-3"
              >
                <span className="font-mono text-[13px] text-slate-300">
                  {d.device}
                </span>
                {d.status === "healthy" ? (
                  <span className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    {t("settings.diskhealth.healthy")}
                  </span>
                ) : d.status === "failing" ? (
                  <span className="flex items-center gap-1.5 text-[12px] font-medium text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    {t("settings.diskhealth.failing")}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                    <HelpCircle className="h-4 w-4" />
                    {t("settings.diskhealth.unknown")}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
