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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
            <Headset className="h-5 w-5 text-orange-600" />
          </div>
          <CardTitle>Muradi Fjärrsupport</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Aktivera fjärrsupport</span>
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={loading}
          />
        </div>
        {enabled && (
          <div className="flex items-start gap-2 rounded-xl bg-yellow-50 p-3">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-800">
              När denna är aktiv kan en Muradi-tekniker felsöka din box på
              distans.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
