"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";

export function SystemSettings() {
  const { logout } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const [saving, setSaving] = useState(false);

  async function handleLocaleChange(newLocale: "sv" | "en") {
    setLocale(newLocale);
    setSaving(true);
    try {
      await api.updateSettings({ locale: newLocale });
    } catch {
      // Settings saved locally regardless
    }
    setSaving(false);
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Settings className="h-5 w-5 text-gray-500" />
          {locale === "sv" ? "System" : "System"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>{t("auth.setup.language")}</Label>
          <Select
            value={locale}
            onValueChange={(v) => handleLocaleChange(v as "sv" | "en")}
            disabled={saving}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sv">Svenska</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {locale === "sv" ? "Logga ut" : "Log out"}
        </Button>
      </CardContent>
    </Card>
  );
}
