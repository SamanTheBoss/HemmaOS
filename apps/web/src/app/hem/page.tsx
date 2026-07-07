"use client";

import { useEffect, useState } from "react";
import { StatusHeader } from "@/components/dashboard/status-header";
import { StorageCard } from "@/components/dashboard/storage-card";
import { BackupHealth } from "@/components/dashboard/backup-health";
import { RamCard } from "@/components/dashboard/ram-card";
import {
  AppLauncher,
  toInstalledApps,
} from "@/components/dashboard/app-launcher";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";

interface SystemStatus {
  status: string;
  disk: { total: string; used: string; percent: number };
  ram: { percent: number };
  backup: { last_success: string; status: string };
}

type AppStates = Record<string, { installed: boolean; port?: number }>;

export default function HemPage() {
  const [data, setData] = useState<SystemStatus | null>(null);
  const [appStates, setAppStates] = useState<AppStates>({});
  const [error, setError] = useState<string | null>(null);
  const { t, locale } = useI18n();

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t("home.greeting.morning")
      : hour < 18
        ? t("home.greeting.afternoon")
        : t("home.greeting.evening");
  const today = new Date().toLocaleDateString(locale === "sv" ? "sv-SE" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  useEffect(() => {
    api
      .getSystemStatus()
      .then(setData)
      .catch((err) => setError(err.message));

    api
      .listApps()
      .then((res) => {
        const states: AppStates = {};
        for (const a of res.apps) {
          states[a.name] = { installed: a.installed, port: a.port };
        }
        setAppStates(states);
      })
      .catch(() => {
        // apps optional on the home screen
      });
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
      {/* Time-based greeting hero */}
      <div className="pt-1 pb-1">
        <h1 className="text-[26px] font-bold tracking-tight text-white">
          {greeting}
        </h1>
        <p className="mt-0.5 text-sm capitalize text-slate-500">{today}</p>
      </div>

      <StatusHeader status={data.status} />

      {/* OS-style app launcher */}
      <section>
        <h2 className="mb-3 px-1 text-[13px] font-semibold uppercase tracking-wider text-slate-500">
          {t("home.apps")}
        </h2>
        <AppLauncher apps={toInstalledApps(appStates)} />
      </section>

      {/* System widgets */}
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
