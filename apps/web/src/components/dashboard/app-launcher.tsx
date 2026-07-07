"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { APP_DEFINITIONS, type AppDefinition } from "@/lib/app-definitions";
import { useI18n } from "@/lib/i18n-context";

interface InstalledApp {
  app: AppDefinition;
  port?: number;
}

/** OS-style launcher: installed apps as big icons that open on their real port. */
export function AppLauncher({ apps }: { apps: InstalledApp[] }) {
  const { t } = useI18n();

  if (apps.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-card/40 px-6 py-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/15 to-violet/15 border border-line">
          <Plus className="h-6 w-6 text-slate-400" />
        </div>
        <p className="text-[14px] font-semibold text-slate-200">
          {t("home.apps.empty")}
        </p>
        <Link
          href="/appar"
          className="btn mt-4 inline-block rounded-xl bg-gradient-to-r from-accent to-violet px-5 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-violet/25 hover:brightness-110"
        >
          {t("home.apps.browse")}
        </Link>
      </div>
    );
  }

  function open(port?: number) {
    if (typeof window === "undefined" || !port) return;
    window.open(
      `http://${window.location.hostname}:${port}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4 sm:grid-cols-5">
      {apps.map(({ app, port }) => {
        const Icon = app.icon;
        return (
          <button
            key={app.id}
            onClick={() => open(port ?? app.port)}
            className="btn group flex flex-col items-center gap-2"
            title={app.name}
          >
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl ${app.bgColor} transition-transform group-hover:-translate-y-1 group-active:scale-95`}
            >
              <Icon className={`h-8 w-8 ${app.color}`} />
            </div>
            <span className="w-full truncate text-center text-[11.5px] text-slate-300">
              {app.name}
            </span>
          </button>
        );
      })}
      {/* Add-app tile → App Store */}
      <Link
        href="/appar"
        className="btn group flex flex-col items-center gap-2"
        title={t("home.apps.browse")}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-line bg-white/[.03] transition-transform group-hover:-translate-y-1">
          <Plus className="h-7 w-7 text-slate-500" />
        </div>
        <span className="w-full truncate text-center text-[11.5px] text-slate-500">
          {t("home.apps.browse")}
        </span>
      </Link>
    </div>
  );
}

/** Match API app-status rows to the frontend definitions (icon/gradient). */
export function toInstalledApps(
  states: Record<string, { installed: boolean; port?: number }>,
): InstalledApp[] {
  return APP_DEFINITIONS.filter((a) => states[a.id]?.installed).map((a) => ({
    app: a,
    port: states[a.id]?.port,
  }));
}
