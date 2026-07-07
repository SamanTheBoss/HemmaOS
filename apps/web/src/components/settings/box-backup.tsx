"use client";

import { useState } from "react";
import { ShieldCheck, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";

export function BoxBackup() {
  const { t } = useI18n();
  const [downloading, setDownloading] = useState(false);

  async function download() {
    setDownloading(true);
    try {
      const blob = await api.downloadConfigBackup();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hemmaos-backup-${new Date().toISOString().slice(0, 10)}.tar.gz`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // ignore — offline or api error
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <CardTitle>{t("settings.boxbackup")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-400">{t("settings.boxbackup.desc")}</p>
        <Button
          variant="outline"
          className="w-full"
          onClick={download}
          disabled={downloading}
        >
          <Download className="h-4 w-4" />
          {downloading
            ? t("settings.boxbackup.downloading")
            : t("settings.boxbackup.download")}
        </Button>
      </CardContent>
    </Card>
  );
}
