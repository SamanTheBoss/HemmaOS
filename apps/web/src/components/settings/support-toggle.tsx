"use client";

import { useState } from "react";
import { Headset, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";

export function SupportToggle() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg shadow-orange-500/20">
            <Headset className="h-5 w-5 text-white" />
          </div>
          <CardTitle>Muradi Fjärrsupport</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Aktivera fjärrsupport</span>
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
              När denna är aktiv kan en Muradi-tekniker felsöka din box på
              distans.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
