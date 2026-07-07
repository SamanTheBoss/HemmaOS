"use client";

import { useEffect, useState } from "react";
import { Server } from "lucide-react";
import { WidgetRow } from "@/components/dashboard/widget-row";
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
  const today = new Date().toLocaleDateString(
    locale === "sv" ? "sv-SE" : "en-US",
    { weekday: "long", day: "numeric", month: "long" },
  );

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
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col items-center text-center">
      {/* Logo mark */}
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-violet shadow-xl shadow-violet/30">
        <Server className="h-6 w-6 text-white" />
      </div>

      {/* Greeting */}
      <h1 className="mt-4 text-[30px] font-bold tracking-tight text-white sm:text-[34px]">
        {greeting}
      </h1>
      <p className="mt-1 text-sm capitalize text-slate-400">{today}</p>

      {error && (
        <p className="mt-4 text-sm text-red-400">{error}</p>
      )}

      {/* Widgets */}
      {data && (
        <div className="mt-8 w-full">
          <WidgetRow
            status={data.status}
            disk={data.disk}
            ram={data.ram}
            backup={data.backup}
          />
        </div>
      )}
      {!data && !error && (
        <div className="mt-8 flex w-full max-w-2xl justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="shimmer h-24 min-w-[110px] flex-1 rounded-2xl border border-line"
            />
          ))}
        </div>
      )}

      {/* App launcher */}
      <div className="mt-10 w-full max-w-3xl">
        <AppLauncher apps={toInstalledApps(appStates)} />
      </div>
    </div>
  );
}
