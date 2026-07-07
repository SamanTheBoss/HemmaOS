"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { APP_DEFINITIONS } from "@/lib/app-definitions";
import { useI18n } from "@/lib/i18n-context";

const STORAGE_KEY = "hemmaos-onboarded";
const RECOMMENDED = ["immich", "vaultwarden", "jellyfin", "adguard"];

/**
 * One-time welcome shown on a fresh box (no apps installed yet) to guide the
 * family to install their first app, so the desktop is never confusingly empty.
 */
export function OnboardingWizard({ hasApps }: { hasApps: boolean }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen && !hasApps) setOpen(true);
  }, [hasApps]);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  function go(target: string) {
    dismiss();
    router.push(target);
  }

  const recommended = RECOMMENDED.map((id) =>
    APP_DEFINITIONS.find((a) => a.id === id),
  ).filter((a): a is (typeof APP_DEFINITIONS)[number] => Boolean(a));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && dismiss()}>
      <DialogContent className="max-w-lg text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-violet shadow-xl shadow-violet/30">
          <span className="text-2xl">🏠</span>
        </div>
        <DialogTitle className="mt-4 text-xl font-bold tracking-tight text-white">
          {t("onboarding.title")}
        </DialogTitle>
        <DialogDescription className="mx-auto mt-1 max-w-sm text-sm text-slate-400">
          {t("onboarding.subtitle")}
        </DialogDescription>

        <p className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
          {t("onboarding.recommended")}
        </p>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {recommended.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                onClick={() => go("/appar")}
                className="btn group flex flex-col items-center gap-2"
                title={app.name}
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${app.bgColor} transition-transform group-hover:-translate-y-1`}
                >
                  <Icon className={`h-7 w-7 ${app.color}`} />
                </div>
                <span className="w-full truncate text-center text-[11px] text-slate-400">
                  {locale === "sv" ? app.description : app.descriptionEn}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-7 flex flex-col gap-2">
          <Button onClick={() => go("/appar")}>{t("onboarding.browse")}</Button>
          <Button variant="ghost" onClick={dismiss}>
            {t("onboarding.skip")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
