"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AppDefinition } from "@/lib/app-definitions";
import { useI18n } from "@/lib/i18n-context";

interface AppCardProps {
  app: AppDefinition;
  installed: boolean;
  /** The app's own port; the card opens http://<box-ip>:<port>. */
  port?: number;
  onInstall: () => void;
  onUninstall: () => void;
  /** Clicking the card body opens the detail view. */
  onOpenDetail: () => void;
}

export function AppCard({
  app,
  installed,
  port,
  onInstall,
  onUninstall,
  onOpenDetail,
}: AppCardProps) {
  const { t, locale } = useI18n();
  const Icon = app.icon;
  const description = locale === "sv" ? app.description : app.descriptionEn;
  const openPort = port ?? app.port;

  // Open the app on its real port, on whichever host the dashboard is being
  // viewed from (the box's LAN IP or hostname the user typed).
  function openApp() {
    if (typeof window === "undefined" || !openPort) return;
    window.open(
      `http://${window.location.hostname}:${openPort}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <Card
      className="card-lift flex flex-col cursor-pointer"
      onClick={onOpenDetail}
    >
      <CardContent className="flex flex-col items-center gap-3 p-5">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${app.bgColor}`}
        >
          <Icon className={`h-7 w-7 ${app.color}`} />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-white">{app.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
        {installed ? (
          <div className="flex w-full gap-2">
            <Button
              variant="success"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                openApp();
              }}
            >
              {t("apps.open")}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 text-red-400 hover:text-red-300 hover:border-red-400/30"
              onClick={(e) => {
                e.stopPropagation();
                onUninstall();
              }}
              title={t("apps.uninstall")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onInstall();
            }}
          >
            {t("apps.install")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
