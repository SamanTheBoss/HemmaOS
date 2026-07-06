"use client";

import { useEffect, useState } from "react";
import { Headset, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";

export function SupportToggle() {
  const { t } = useI18n();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  // null = still checking; false = no support key set → hide the whole control.
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    api
      .getSupportStatus()
      .then((s) => setConfigured(s.configured))
      .catch(() => setConfigured(false));
  }, []);

  async function handleToggle(checked: boolean) {
    setLoading(true);
    try {
      const result = await api.toggleSupport(checked);
      setEnabled(result.support_active);
    } catch {
      // revert on failure
    } finally {
      setLoading(false);
    }
  }

  // No operator support key configured → don't show a half-working toggle.
  if (!configured) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg shadow-orange-500/20">
            <Headset className="h-5 w-5 text-white" />
          </div>
          <CardTitle>{t("settings.support")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">{t("settings.support.toggle")}</span>
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={loading}
          />
        </div>
        {enabled && (
          <div className="flex items-start gap-2 rounded-xl bg-amber-400/10 border border-amber-400/20 p-3">
            <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-200/90">
              {t("settings.support.warning")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
