"use client";

import {
  CloudUpload,
  CheckCircle2,
  AlertTriangle,
  CloudOff,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n-context";

interface BackupHealthProps {
  lastSuccess: string;
  status: string;
}

export function BackupHealth({ lastSuccess, status }: BackupHealthProps) {
  const { t } = useI18n();
  const isOk = status === "OK";
  const isFailed = status === "FAILED";
  const isUnknown = status === "UNKNOWN";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-purple-700 shadow-lg shadow-violet/25">
            <CloudUpload className="h-5 w-5 text-white" />
          </div>
          <CardTitle>{t("dashboard.backup")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {isOk && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
          {isFailed && <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
          {isUnknown && <CloudOff className="h-4 w-4 text-slate-500 shrink-0" />}
          <p className="text-sm text-slate-300">{lastSuccess}</p>
        </div>
        {isUnknown && (
          <p className="text-xs text-slate-500 mt-2">
            {t("dashboard.backup.configure")}
          </p>
        )}
        {isFailed && (
          <p className="text-xs text-red-400 mt-2">
            {t("dashboard.backup.failed")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
