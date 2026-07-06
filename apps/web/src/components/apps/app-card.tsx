"use client";

import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AppDefinition } from "@/lib/app-definitions";

interface AppCardProps {
  app: AppDefinition;
  installed: boolean;
  url?: string;
  onInstall: () => void;
}

export function AppCard({ app, installed, url, onInstall }: AppCardProps) {
  const Icon = app.icon;

  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-col items-center gap-3 p-5">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${app.bgColor}`}
        >
          <Icon className={`h-7 w-7 ${app.color}`} />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-gray-900">{app.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{app.description}</p>
        </div>
        {installed ? (
          <div className="flex w-full gap-2">
            <Button
              variant="success"
              size="sm"
              className="flex-1"
              asChild
            >
              <a href={url} target="_blank" rel="noopener noreferrer">
                Öppna
              </a>
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button size="sm" className="w-full" onClick={onInstall}>
            Installera
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
