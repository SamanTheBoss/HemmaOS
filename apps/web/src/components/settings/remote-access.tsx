"use client";

import { useEffect, useState } from "react";
import { Globe, ExternalLink, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";

export function RemoteAccess() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [running, setRunning] = useState(false);
  const [hostname, setHostname] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  // Poll for status changes when auth URL is shown
  useEffect(() => {
    if (!authUrl) return;
    const interval = setInterval(async () => {
      try {
        const status = await api.getTailscaleStatus();
        if (status.authenticated) {
          setAuthenticated(true);
          setRunning(status.running);
          setHostname(status.hostname);
          setAuthUrl(null);
        }
      } catch {
        // keep polling
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [authUrl]);

  async function loadStatus() {
    setLoading(true);
    try {
      const status = await api.getTailscaleStatus();
      setAuthenticated(status.authenticated);
      setRunning(status.running);
      setHostname(status.hostname);
    } catch {
      // offline or tailscale not installed
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(checked: boolean) {
    setToggling(true);
    try {
      if (checked) {
        const result = await api.startTailscaleAuth();
        if (result.alreadyAuthenticated) {
          setAuthenticated(true);
          setRunning(true);
          await loadStatus();
        } else if (result.authUrl) {
          setAuthUrl(result.authUrl);
        }
      } else {
        await api.stopTailscale();
        setRunning(false);
        setAuthenticated(false);
        setHostname(null);
      }
    } catch {
      // revert
    } finally {
      setToggling(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-teal-600 shadow-lg shadow-teal-500/20">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <CardTitle>{t("settings.remote")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">
                  {t("settings.remote.desc")}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{t("settings.remote.via")}</p>
              </div>
              <Switch
                checked={running}
                onCheckedChange={handleToggle}
                disabled={toggling}
              />
            </div>

            {authenticated && hostname && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-400/10 border border-emerald-400/20 p-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-200/90 truncate">{hostname}</p>
              </div>
            )}

            {!authenticated && !authUrl && !running && (
              <div className="flex items-center gap-2 rounded-xl bg-white/[.03] border border-line p-3">
                <XCircle className="h-4 w-4 text-slate-500 shrink-0" />
                <p className="text-xs text-slate-400">
                  {t("settings.remote.off")}
                </p>
              </div>
            )}

            {authUrl && (
              <div className="space-y-3">
                <p className="text-sm text-slate-400">
                  {t("settings.remote.signin")}
                </p>
                <Button asChild className="w-full" size="sm">
                  <a
                    href={authUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {t("settings.remote.login")}
                  </a>
                </Button>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {t("settings.remote.waiting")}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
