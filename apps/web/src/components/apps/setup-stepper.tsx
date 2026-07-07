"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import type { AppDefinition } from "@/lib/app-definitions";
import { useI18n } from "@/lib/i18n-context";

interface SetupStepperProps {
  app: AppDefinition;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

type Step = "config" | "deploying" | "done";

export function SetupStepper({
  app,
  open,
  onOpenChange,
  onComplete,
}: SetupStepperProps) {
  const { t, locale } = useI18n();
  const description = locale === "sv" ? app.description : app.descriptionEn;
  // Open the freshly-installed app on its real port, on the host the dashboard
  // is viewed from — not the Caddy/localhost URL from the install response.
  const appUrl =
    typeof window !== "undefined"
      ? `http://${window.location.hostname}:${app.port}`
      : "#";
  const [step, setStep] = useState<Step>("config");
  const [env, setEnv] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  function handleEnvChange(key: string, value: string) {
    setEnv((prev) => ({ ...prev, [key]: value }));
  }

  function stopProgress() {
    if (progressTimer.current) clearInterval(progressTimer.current);
    progressTimer.current = null;
  }

  // Poll the backend for real install progress (layers downloaded/extracted).
  function pollProgress() {
    progressTimer.current = setInterval(async () => {
      try {
        const p = await api.getInstallProgress(app.id);
        setProgress(p.percent);
        if (p.done) {
          stopProgress();
          if (p.error) {
            setError(p.error);
            setStep("config");
          } else {
            setProgress(100);
            onComplete();
            setStep("done");
          }
        }
      } catch {
        // transient — keep polling
      }
    }, 1500);
  }

  async function handleInstall() {
    setStep("deploying");
    setError(null);
    setProgress(0);
    try {
      await api.installApp(app.id, env); // starts the background install
      pollProgress();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
      setStep("config");
    }
  }

  function handleClose() {
    if (step === "deploying") return;
    stopProgress();
    setProgress(0);
    setStep("config");
    setEnv({});
    setError(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        {step === "config" && (
          <>
            <DialogTitle>
              {t("apps.install")} {app.name}
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>

            {error && (
              <p className="text-sm text-red-300 bg-red-400/10 border border-red-400/20 rounded-xl p-3">
                {error}
              </p>
            )}

            {app.envFields.length > 0 ? (
              <div className="space-y-4 mt-4">
                {app.envFields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <Input
                      id={field.key}
                      type={field.type}
                      value={env[field.key] ?? ""}
                      onChange={(e) =>
                        handleEnvChange(field.key, e.target.value)
                      }
                      placeholder={field.label}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 mt-4">
                {t("apps.no.config")}
              </p>
            )}

            <Button onClick={handleInstall} className="w-full mt-6">
              {t("apps.install")} {app.name}
            </Button>
          </>
        )}

        {step === "deploying" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <DialogTitle className="sr-only">{t("apps.installing")}</DialogTitle>
            <Loader2 className="h-12 w-12 animate-spin text-violet" />
            <p className="text-lg font-semibold text-white">
              {t("apps.installing")}
            </p>
            <div className="w-full max-w-xs">
              <Progress value={progress} />
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">{t("apps.installing.wait")}</span>
                <span className="font-mono text-slate-400">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <DialogTitle className="sr-only">{t("apps.done")}</DialogTitle>
            <CheckCircle2 className="h-16 w-16 text-emerald-400" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              {t("apps.done")}
            </h2>
            <p className="text-sm text-slate-400 text-center">
              {t("apps.done.message", { name: app.name })}
            </p>

            {app.mobileApp && (
              <p className="text-xs text-slate-400 text-center bg-white/[.03] border border-line rounded-xl p-3">
                {t("apps.done.mobile", { app: app.mobileApp })}
              </p>
            )}

            <Button asChild className="w-full mt-2">
              <a href={appUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                {t("apps.goto")}
              </a>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
