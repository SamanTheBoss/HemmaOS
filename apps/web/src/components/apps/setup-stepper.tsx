"use client";

import { useState } from "react";
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
import { api } from "@/lib/api";
import type { AppDefinition } from "@/lib/app-definitions";

interface SetupStepperProps {
  app: AppDefinition;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (url: string) => void;
}

type Step = "config" | "deploying" | "done";

export function SetupStepper({
  app,
  open,
  onOpenChange,
  onComplete,
}: SetupStepperProps) {
  const [step, setStep] = useState<Step>("config");
  const [env, setEnv] = useState<Record<string, string>>({});
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleEnvChange(key: string, value: string) {
    setEnv((prev) => ({ ...prev, [key]: value }));
  }

  async function handleInstall() {
    setStep("deploying");
    setError(null);
    try {
      const result = await api.installApp(app.id, env);
      setResultUrl(result.url);
      onComplete(result.url);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
      setStep("config");
    }
  }

  function handleClose() {
    if (step === "deploying") return;
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
            <DialogTitle>Installera {app.name}</DialogTitle>
            <DialogDescription>{app.description}</DialogDescription>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3">
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
              <p className="text-sm text-gray-500 mt-4">
                Inga inställningar krävs. Appen är redo att installeras.
              </p>
            )}

            <Button onClick={handleInstall} className="w-full mt-6">
              Installera {app.name}
            </Button>
          </>
        )}

        {step === "deploying" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <DialogTitle className="sr-only">Installerar...</DialogTitle>
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <p className="text-lg font-medium text-gray-700">
              HemmaOS konfigurerar din app...
            </p>
            <p className="text-sm text-gray-400">
              Detta kan ta en liten stund
            </p>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <DialogTitle className="sr-only">Klart!</DialogTitle>
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h2 className="text-xl font-bold text-gray-900">Klart!</h2>
            <p className="text-sm text-gray-500 text-center">
              {app.name} är nu installerat och redo att användas.
            </p>

            {app.mobileApp && (
              <p className="text-xs text-gray-400 text-center bg-gray-50 rounded-xl p-3">
                Ladda ner mobilappen <strong>{app.mobileApp}</strong> och
                anslut med adressen ovan.
              </p>
            )}

            <Button asChild className="w-full mt-2">
              <a href={resultUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Gå till min app
              </a>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
