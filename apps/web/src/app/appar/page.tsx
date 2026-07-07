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

      {CATEGORIES.map((cat) => {
        const apps = APP_DEFINITIONS.filter((a) => a.category === cat.id);
        if (apps.length === 0) return null;
        return (
          <div key={cat.id} className="pt-2">
            <div className="mb-3 flex items-center gap-3">
              <h2 className="text-[15px] font-semibold text-white">
                {locale === "sv" ? cat.label.sv : cat.label.en}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-line to-transparent" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {apps.map((app) => {
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
          </div>
        );
      })}

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
