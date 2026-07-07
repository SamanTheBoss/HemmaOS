"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { AppCard } from "@/components/apps/app-card";
import { AppDetail } from "@/components/apps/app-detail";
import { SetupStepper } from "@/components/apps/setup-stepper";
import {
  APP_DEFINITIONS,
  CATEGORIES,
  type AppDefinition,
  type CategoryId,
} from "@/lib/app-definitions";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";

interface AppState {
  installed: boolean;
  running: boolean;
  url: string | null;
  port?: number;
}

export default function ApparPage() {
  const [appStates, setAppStates] = useState<Record<string, AppState>>({});
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<AppDefinition | null>(null);
  const [detailApp, setDetailApp] = useState<AppDefinition | null>(null);
  const [activeCat, setActiveCat] = useState<CategoryId | "all">("all");
  const { t, locale } = useI18n();

  const loadApps = useCallback(async () => {
    try {
      const data = await api.listApps();
      const states: Record<string, AppState> = {};
      for (const app of data.apps) {
        states[app.name] = {
          installed: app.installed,
          running: app.running,
          url: app.url,
          port: app.port,
        };
      }
      setAppStates(states);
    } catch {
      // API not available — show all as not installed
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  function handleComplete() {
    // Refresh from the API so the new app's real port/status are picked up.
    loadApps();
  }

  async function handleUninstall(app: AppDefinition) {
    if (!window.confirm(t("apps.uninstall.confirm", { name: app.name }))) return;
    try {
      await api.uninstallApp(app.id);
    } catch {
      // ignore — reload reflects the real state
    }
    loadApps();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-violet" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-white">{t("apps.title")}</h1>
      <p className="text-sm text-slate-400">{t("apps.subtitle")}</p>

      {/* Category tabs */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {[{ id: "all" as const, label: { sv: t("apps.category.all"), en: t("apps.category.all") } }, ...CATEGORIES].map(
          (cat) => {
            const active = activeCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={
                  "btn shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-all " +
                  (active
                    ? "bg-gradient-to-r from-accent to-violet text-white shadow-lg shadow-violet/25"
                    : "border border-line bg-white/[.03] text-slate-300 hover:bg-white/[.06] hover:text-white")
                }
              >
                {locale === "sv" ? cat.label.sv : cat.label.en}
              </button>
            );
          },
        )}
      </div>

      {/* Filtered app grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {APP_DEFINITIONS.filter(
          (a) => activeCat === "all" || a.category === activeCat,
        ).map((app) => {
          const state = appStates[app.id];
          return (
            <AppCard
              key={app.id}
              app={app}
              installed={state?.installed ?? false}
              port={state?.port}
              onInstall={() => setSelectedApp(app)}
              onUninstall={() => handleUninstall(app)}
              onOpenDetail={() => setDetailApp(app)}
            />
          );
        })}
      </div>

      {detailApp && (
        <AppDetail
          app={detailApp}
          installed={appStates[detailApp.id]?.installed ?? false}
          port={appStates[detailApp.id]?.port}
          open={!!detailApp}
          onOpenChange={(open) => {
            if (!open) setDetailApp(null);
          }}
          onInstall={() => {
            setSelectedApp(detailApp);
            setDetailApp(null);
          }}
          onUninstall={() => {
            const app = detailApp;
            setDetailApp(null);
            if (app) handleUninstall(app);
          }}
        />
      )}

      {selectedApp && (
        <SetupStepper
          app={selectedApp}
          open={!!selectedApp}
          onOpenChange={(open) => {
            if (!open) setSelectedApp(null);
          }}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
