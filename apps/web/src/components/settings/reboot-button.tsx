"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";

export function RebootButton() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReboot() {
    setLoading(true);
    try {
      await api.reboot();
    } catch {
      // Server will go down — expected
    }
    setLoading(false);
    setOpen(false);
  }

  return (
    <>
      <Button
        variant="destructive"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <RotateCcw className="h-4 w-4" />
        {t("settings.reboot")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>{t("settings.reboot.confirm")}</DialogTitle>
          <DialogDescription>
            {t("settings.reboot.warning")}
          </DialogDescription>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              {t("settings.reboot.cancel")}
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleReboot}
              disabled={loading}
            >
              {loading ? `${t("settings.reboot.action")}...` : t("settings.reboot.action")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
