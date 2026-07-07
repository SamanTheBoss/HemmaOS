"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Download, CheckCircle2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";

interface UpdateState {
  current: string;
  latest: string | null;
  hasUpdate: boolean;
  changelog: string | null;
  url: string | null;
}

export function UpdateManager() {
  const { t } = useI18n();
  const [info, setInfo] = useState<UpdateState | null>(null);
  const [checking, setChecking] = useState(false);
  const [applying, setApplying] = useState(false);

  async function check() {
    setChecking(true);
    try {
      setInfo(await api.checkUpdate());
    } catch {
      // ignore — offline or no releases
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    check();
  }, []);

  async function apply() {
    setApplying(true);
    try {
      await api.applyUpdate();
    } catch {
      // the box restarts mid-request — expected
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-violet shadow-lg shadow-violet/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <CardTitle>{t("settings.update")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">{t("settings.update.current")}</p>
            <p className="font-mono text-sm text-slate-200">
              {info?.current ?? "—"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={check}
            disabled={checking || applying}
          >
            <RefreshCw
              className={`h-4 w-4 ${checking ? "animate-spin" : ""}`}
            />
            {checking ? t("settings.update.checking") : t("settings.update.check")}
          </Button>
        </div>

        {info && !info.hasUpdate && !checking && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-400/10 border border-emerald-400/20 p-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <p className="text-xs text-emerald-200/90">
              {t("settings.update.uptodate")}
            </p>
          </div>
        )}

        {info?.hasUpdate && (
          <div className="rounded-xl border border-violet/30 bg-violet/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-violet-200">
                {t("settings.update.available")} · {info.latest}
              </p>
            </div>
            {info.changelog && (
              <div className="mt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {t("settings.update.changelog")}
                </p>
                <pre className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-slate-300">
                  {info.changelog}
                </pre>
              </div>
            )}
            <Button
              className="mt-4 w-full"
              onClick={apply}
              disabled={applying}
            >
              <Download className="h-4 w-4" />
              {applying
                ? t("settings.update.applying")
                : t("settings.update.apply")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
