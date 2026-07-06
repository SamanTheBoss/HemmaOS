"use client";

import { useEffect, useState } from "react";
import { StatusHeader } from "@/components/dashboard/status-header";
import { StorageCard } from "@/components/dashboard/storage-card";
import { BackupHealth } from "@/components/dashboard/backup-health";
import { RamCard } from "@/components/dashboard/ram-card";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";

interface SystemStatus {
  status: string;
  disk: { total: string; used: string; percent: number };
  ram: { percent: number };
  backup: { last_success: string; status: string };
}

export default function HemPage() {
  const [data, setData] = useState<SystemStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    api
      .getSystemStatus()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="space-y-4">
        <StatusHeader status="UNHEALTHY" />
        <p className="text-sm text-red-400 text-center">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <div className="shimmer rounded-2xl border border-line h-28" />
        <div className="shimmer rounded-2xl border border-line h-36" />
        <div className="shimmer rounded-2xl border border-line h-36" />
        <div className="shimmer rounded-2xl border border-line h-28" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StatusHeader status={data.status} />
      <StorageCard
        total={data.disk.total}
        used={data.disk.used}
        percent={data.disk.percent}
      />
      <RamCard percent={data.ram.percent} />
      <BackupHealth
        lastSuccess={data.backup.last_success}
        status={data.backup.status}
      />
    </div>
  );
}
