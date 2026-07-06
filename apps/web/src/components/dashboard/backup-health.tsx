"use client";

import {
  CloudUpload,
  CheckCircle2,
  AlertTriangle,
  CloudOff,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BackupHealthProps {
  lastSuccess: string;
  status: string;
}

export function BackupHealth({ lastSuccess, status }: BackupHealthProps) {
  const isOk = status === "OK";
  const isFailed = status === "FAILED";
  const isUnknown = status === "UNKNOWN";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
            <CloudUpload className="h-5 w-5 text-purple-600" />
          </div>
          <CardTitle>Backup</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {isOk && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
          {isFailed && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
          {isUnknown && <CloudOff className="h-4 w-4 text-gray-400 shrink-0" />}
          <p className="text-sm text-gray-700">{lastSuccess}</p>
        </div>
        {isUnknown && (
          <p className="text-xs text-gray-400 mt-2">
            Konfigurera synkronisering under Inställningar.
          </p>
        )}
        {isFailed && (
          <p className="text-xs text-red-400 mt-2">
            Kontrollera synkinställningarna.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
