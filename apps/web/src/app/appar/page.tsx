"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { AppCard } from "@/components/apps/app-card";
import { SetupStepper } from "@/components/apps/setup-stepper";
import { APP_DEFINITIONS, type AppDefinition } from "@/lib/app-definitions";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";

interface AppState {
  installed: boolean;
  running: boolean;
  url: string | null;
}

export default function ApparPage() {
  const [appStates, setAppStates] = useState<Record<string, AppState>>({});
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<AppDefinition | null>(null);
  const { t } = useI18n();

  const loadApps = useCallback(async () => {
    try {
      const data = await api.listApps();
      const states: Record<string, AppState> = {};
      for (const app of data.apps) {
        states[app.name] = {
          installed: app.installed,
          running: app.running,
          url: app.url,
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

  function handleComplete(url: string) {
    if (selectedApp) {
      setAppStates((prev) => ({
        ...prev,
        [selectedApp.id]: { installed: true, running: true, url },
      }));
    }
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

      <div className="grid grid-cols-2 gap-3">
        {APP_DEFINITIONS.map((app) => {
          const state = appStates[app.id];
          return (
            <AppCard
              key={app.id}
              app={app}
              installed={state?.installed ?? false}
              url={state?.url ?? undefined}
              onInstall={() => setSelectedApp(app)}
            />
          );
        })}
      </div>

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
