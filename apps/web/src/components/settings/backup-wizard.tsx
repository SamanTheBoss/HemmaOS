"use client";

import { useEffect, useRef, useState } from "react";
import {
  HardDrive,
  Usb,
  Cloud,
  CheckCircle2,
  Loader2,
  FolderSync,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface BackupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

type Step =
  | "target"
  | "cloud-pick"
  | "cloud-auth"
  | "sources"
  | "schedule"
  | "creating"
  | "done";
type TargetType = "local" | "usb" | "cloud";

interface CloudProvider {
  id: string;
  rcloneType: string;
  label: string;
}

const SOURCES = [
  { id: "all", label: "Allt" },
  { id: "immich", label: "Immich (foton)" },
  { id: "jellyfin", label: "Jellyfin (media)" },
  { id: "vaultwarden", label: "Vaultwarden (lösenord)" },
  { id: "audiobookshelf", label: "Audiobookshelf" },
  { id: "adguard", label: "AdGuard Home" },
] as const;

const SCHEDULES = [
  { id: "daily", label: "Dagligen (kl 03:00)" },
  { id: "weekly", label: "Varje söndag (kl 03:00)" },
  { id: "monthly", label: "1:a varje månad" },
  { id: "manual", label: "Bara manuellt" },
] as const;

export function BackupWizard({
  open,
  onOpenChange,
  onComplete,
}: BackupWizardProps) {
  const [step, setStep] = useState<Step>("target");
  const [targetType, setTargetType] = useState<TargetType | null>(null);
  const [targetPath, setTargetPath] = useState("");
  const [name, setName] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>(["all"]);
  const [schedule, setSchedule] = useState("daily");
  const [usbDevices, setUsbDevices] = useState<
    { name: string; path: string; size: string; mounted: boolean }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  // Cloud auth state
  const [cloudProviders, setCloudProviders] = useState<CloudProvider[]>([]);
  const [selectedCloud, setSelectedCloud] = useState<CloudProvider | null>(
    null,
  );
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [authDone, setAuthDone] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (open && targetType === "usb") {
      api
        .getUsbDevices()
        .then((data) => setUsbDevices(data.devices))
        .catch(() => setUsbDevices([]));
    }
  }, [open, targetType]);

  useEffect(() => {
    if (open && step === "cloud-pick" && cloudProviders.length === 0) {
      api
        .getCloudProviders()
        .then((data) => setCloudProviders(data.providers))
        .catch(() => {});
    }
  }, [open, step, cloudProviders.length]);

  // Poll for auth completion
  useEffect(() => {
    if (step !== "cloud-auth") {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    pollRef.current = setInterval(async () => {
      try {
        const status = await api.getCloudAuthStatus();
        if (status.authUrl && !authUrl) {
          setAuthUrl(status.authUrl);
        }
        if (status.done && status.token && selectedCloud) {
          await api.saveCloudToken(selectedCloud.id, status.token);
          setAuthDone(true);
          if (pollRef.current) clearInterval(pollRef.current);
        }
        if (status.done && status.error) {
          setError(status.error);
          setStep("cloud-pick");
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // keep polling
      }
    }, 2000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [step, authUrl, selectedCloud]);

  function toggleSource(id: string) {
    if (id === "all") {
      setSelectedSources(["all"]);
      return;
    }
    setSelectedSources((prev) => {
      const without = prev.filter((s) => s !== "all" && s !== id);
      if (prev.includes(id)) return without.length ? without : ["all"];
      return [...without, id];
    });
  }

  async function handleStartCloudAuth(provider: CloudProvider) {
    setSelectedCloud(provider);
    setAuthUrl(null);
    setAuthDone(false);
    setError(null);

    try {
      const result = await api.startCloudAuth(provider.id);
      if (!result.started) {
        setError(result.message);
        return;
      }
      setStep("cloud-auth");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
    }
  }

  function handleCloudAuthComplete() {
    // Set the actual targetType to the cloud provider id for the backup job
    setTargetPath(targetPath || "hemmaos-backup");
    setStep("sources");
  }

  async function handleCreate() {
    if (!name) return;
    setStep("creating");
    setError(null);

    const actualTargetType =
      targetType === "cloud" && selectedCloud
        ? selectedCloud.id
        : targetType === "cloud"
          ? "gdrive"
          : (targetType as string);

    try {
      await api.createBackupJob({
        name,
        targetType: actualTargetType,
        targetPath: targetPath || "hemmaos-backup",
        sources: selectedSources,
        schedule,
      });
      onComplete();
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
      setStep("schedule");
    }
  }

  function handleClose() {
    if (step === "creating") return;
    if (pollRef.current) clearInterval(pollRef.current);
    // Cancel any ongoing auth
    if (step === "cloud-auth") {
      api.cancelCloudAuth().catch(() => {});
    }
    setStep("target");
    setTargetType(null);
    setTargetPath("");
    setName("");
    setSelectedSources(["all"]);
    setSchedule("daily");
    setSelectedCloud(null);
    setAuthUrl(null);
    setAuthDone(false);
    setError(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        {step === "target" && (
          <>
            <DialogTitle>Ny synkronisering</DialogTitle>
            <DialogDescription>
              Välj var du vill synka dina filer till.
            </DialogDescription>

            <div className="space-y-3 mt-4">
              <Label>Namn</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="T.ex. Daglig backup till USB"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                {
                  type: "local" as TargetType,
                  icon: HardDrive,
                  label: "Lokal mapp",
                },
                {
                  type: "usb" as TargetType,
                  icon: Usb,
                  label: "USB-disk",
                },
                {
                  type: "cloud" as TargetType,
                  icon: Cloud,
                  label: "Moln",
                },
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => setTargetType(type)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors",
                    targetType === type
                      ? "border-violet/60 bg-violet/10"
                      : "border-line hover:border-[#343a52]",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-6 w-6",
                      targetType === type ? "text-violet-300" : "text-slate-500",
                    )}
                  />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>

            {targetType === "local" && (
              <div className="mt-4 space-y-2">
                <Label>Sökväg</Label>
                <Input
                  value={targetPath}
                  onChange={(e) => setTargetPath(e.target.value)}
                  placeholder="/mnt/backup"
                />
              </div>
            )}

            {targetType === "usb" && (
              <div className="mt-4 space-y-2">
                <Label>Välj USB-enhet</Label>
                {usbDevices.length > 0 ? (
                  <Select value={targetPath} onValueChange={setTargetPath}>
                    <SelectTrigger>
                      <SelectValue placeholder="Välj enhet..." />
                    </SelectTrigger>
                    <SelectContent>
                      {usbDevices.map((d) => (
                        <SelectItem key={d.path} value={d.path}>
                          {d.name} ({d.size})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-slate-500">
                    Ingen USB-enhet hittades. Anslut en och försök igen.
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={() => {
                if (targetType === "cloud") {
                  setStep("cloud-pick");
                } else {
                  setStep("sources");
                }
              }}
              className="w-full mt-6"
              disabled={
                !targetType ||
                !name ||
                (targetType !== "cloud" && !targetPath)
              }
            >
              Nästa
            </Button>
          </>
        )}

        {step === "cloud-pick" && (
          <>
            <DialogTitle>Välj molntjänst</DialogTitle>
            <DialogDescription>
              Logga in med ditt konto för att synka filer dit.
            </DialogDescription>

            {error && (
              <p className="text-sm text-red-300 bg-red-400/10 border border-red-400/20 rounded-xl p-3 mt-2">
                {error}
              </p>
            )}

            <div className="space-y-2 mt-4">
              {cloudProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleStartCloudAuth(provider)}
                  className="flex w-full items-center gap-3 rounded-xl border border-line bg-white/[.02] p-4 transition-colors hover:border-violet/40 hover:bg-violet/10 text-left"
                >
                  <Cloud className="h-5 w-5 text-violet-300" />
                  <span className="text-sm font-medium text-slate-200">{provider.label}</span>
                </button>
              ))}
              {cloudProviders.length === 0 && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                </div>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setStep("target")}
            >
              Tillbaka
            </Button>
          </>
        )}

        {step === "cloud-auth" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <DialogTitle>
              Logga in på {selectedCloud?.label ?? "molntjänsten"}
            </DialogTitle>

            {!authUrl && !authDone && (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-violet" />
                <p className="text-sm text-slate-400">
                  Förbereder inloggning...
                </p>
              </>
            )}

            {authUrl && !authDone && (
              <>
                <p className="text-sm text-slate-400 text-center">
                  Klicka på knappen nedan för att logga in. Kom tillbaka hit
                  efteråt.
                </p>
                <Button asChild className="w-full">
                  <a href={authUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Öppna inloggning
                  </a>
                </Button>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Väntar på att du loggar in...
                </div>
              </>
            )}

            {authDone && (
              <>
                <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                <p className="text-sm text-emerald-300 font-medium">
                  Inloggning lyckades!
                </p>

                <div className="w-full space-y-2 mt-2">
                  <Label>Mappnamn i {selectedCloud?.label}</Label>
                  <Input
                    value={targetPath}
                    onChange={(e) => setTargetPath(e.target.value)}
                    placeholder="hemmaos-backup"
                  />
                </div>

                <Button
                  className="w-full mt-2"
                  onClick={handleCloudAuthComplete}
                >
                  Nästa
                </Button>
              </>
            )}

            {!authDone && (
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  api.cancelCloudAuth().catch(() => {});
                  setStep("cloud-pick");
                }}
              >
                Avbryt
              </Button>
            )}
          </div>
        )}

        {step === "sources" && (
          <>
            <DialogTitle>Vad ska synkas?</DialogTitle>
            <DialogDescription>
              Välj vilken data som ska ingå i synkroniseringen.
            </DialogDescription>

            <div className="space-y-2 mt-4">
              {SOURCES.map((source) => (
                <button
                  key={source.id}
                  onClick={() => toggleSource(source.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border-2 p-3 transition-colors text-left",
                    selectedSources.includes(source.id)
                      ? "border-violet/60 bg-violet/10"
                      : "border-line hover:border-[#343a52]",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-md border-2",
                      selectedSources.includes(source.id)
                        ? "border-violet bg-violet"
                        : "border-slate-600",
                    )}
                  >
                    {selectedSources.includes(source.id) && (
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{source.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() =>
                  setStep(targetType === "cloud" ? "cloud-auth" : "target")
                }
              >
                Tillbaka
              </Button>
              <Button
                className="flex-1"
                onClick={() => setStep("schedule")}
                disabled={selectedSources.length === 0}
              >
                Nästa
              </Button>
            </div>
          </>
        )}

        {step === "schedule" && (
          <>
            <DialogTitle>Hur ofta?</DialogTitle>
            <DialogDescription>
              Välj schema för automatisk synkronisering.
            </DialogDescription>

            {error && (
              <p className="text-sm text-red-300 bg-red-400/10 border border-red-400/20 rounded-xl p-3 mt-2">
                {error}
              </p>
            )}

            <div className="space-y-2 mt-4">
              {SCHEDULES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSchedule(s.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border-2 p-3 transition-colors text-left",
                    schedule === s.id
                      ? "border-violet/60 bg-violet/10"
                      : "border-line hover:border-[#343a52]",
                  )}
                >
                  <div
                    className={cn(
                      "h-4 w-4 rounded-full border-2",
                      schedule === s.id
                        ? "border-violet bg-violet"
                        : "border-slate-600",
                    )}
                  />
                  <span className="text-sm font-medium">{s.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("sources")}
              >
                Tillbaka
              </Button>
              <Button className="flex-1" onClick={handleCreate}>
                Skapa
              </Button>
            </div>
          </>
        )}

        {step === "creating" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <DialogTitle className="sr-only">Skapar...</DialogTitle>
            <Loader2 className="h-12 w-12 animate-spin text-violet" />
            <p className="text-lg font-semibold text-white">
              Konfigurerar synkronisering...
            </p>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <DialogTitle className="sr-only">Klart!</DialogTitle>
            <CheckCircle2 className="h-16 w-16 text-emerald-400" />
            <h2 className="text-xl font-bold tracking-tight text-white">Klart!</h2>
            <p className="text-sm text-slate-400 text-center">
              Synkroniseringsjobbet &quot;{name}&quot; har skapats.
            </p>
            <Button className="w-full mt-2" onClick={handleClose}>
              <FolderSync className="h-4 w-4" />
              Stäng
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
