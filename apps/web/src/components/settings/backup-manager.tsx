"use client";

import { useEffect, useState } from "react";
import {
  FolderSync,
  Plus,
  Trash2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ScrollText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackupWizard } from "./backup-wizard";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";

interface BackupLogEntry {
  time: string;
  status: "success" | "failed";
  detail?: string;
}

interface BackupJob {
  id: string;
  name: string;
  targetType: string;
  targetPath: string;
  sources: string[];
  schedule: string;
  lastRun: string | null;
  lastStatus: string;
  enabled: boolean;
  history?: BackupLogEntry[];
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  failed: <XCircle className="h-4 w-4 text-red-400" />,
  running: <Loader2 className="h-4 w-4 text-accent animate-spin" />,
  never: <Clock className="h-4 w-4 text-slate-600" />,
};

// Green/red-flag meta so a non-technical family sees at a glance whether a
// backup is healthy — a colored dot + plain-language label, like the box card.
const STATUS_META: Record<
  string,
  { dot: string; text: string; labelKey: string }
> = {
  success: {
    dot: "bg-emerald-400 shadow-emerald-400/50",
    text: "text-emerald-400",
    labelKey: "settings.sync.status.ok",
  },
  failed: {
    dot: "bg-red-400 shadow-red-400/50",
    text: "text-red-400",
    labelKey: "settings.sync.status.failed",
  },
  running: {
    dot: "bg-accent animate-pulse",
    text: "text-accent",
    labelKey: "settings.sync.status.running",
  },
  never: {
    dot: "bg-slate-500",
    text: "text-slate-500",
    labelKey: "settings.sync.status.never",
  },
};

const TARGET_LABELS: Record<string, string> = {
  local: "Lokal mapp",
  usb: "USB-disk",
  gdrive: "Google Drive",
  dropbox: "Dropbox",
  onedrive: "OneDrive",
  box: "Box",
  pcloud: "pCloud",
};

const SCHEDULE_LABELS: Record<string, string> = {
  daily: "Dagligen",
  weekly: "Varje vecka",
  monthly: "Varje månad",
  manual: "Manuell",
};

export function BackupManager() {
  const { t } = useI18n();
  const [jobs, setJobs] = useState<BackupJob[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [runningJob, setRunningJob] = useState<string | null>(null);
  const [openLog, setOpenLog] = useState<string | null>(null);

  function loadJobs() {
    api
      .getBackupJobs()
      .then((data) => setJobs(data.jobs))
      .catch(() => {});
  }

  useEffect(() => {
    loadJobs();
  }, []);

  async function handleDelete(jobId: string) {
    try {
      await api.deleteBackupJob(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch {
      // ignore
    }
  }

  async function handleRun(jobId: string) {
    setRunningJob(jobId);
    try {
      await api.runBackupJob(jobId);
      loadJobs();
    } catch {
      // ignore
    } finally {
      setRunningJob(null);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-teal-600 shadow-lg shadow-teal-500/20">
                <FolderSync className="h-5 w-5 text-white" />
              </div>
              <CardTitle>{t("settings.sync")}</CardTitle>
            </div>
            <Button size="sm" onClick={() => setWizardOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("settings.sync.new")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              {t("settings.sync.empty")}
            </p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-xl border border-line bg-white/[.02]"
                >
                  <div className="flex items-center gap-3 p-3">
                  {STATUS_ICONS[job.lastStatus] ?? STATUS_ICONS.never}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {job.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {TARGET_LABELS[job.targetType] ?? job.targetType} &middot;{" "}
                      {SCHEDULE_LABELS[job.schedule] ?? job.schedule}
                    </p>
                    {(() => {
                      const meta =
                        STATUS_META[job.lastStatus] ?? STATUS_META.never;
                      const when =
                        job.lastRun &&
                        (job.lastStatus === "success" ||
                          job.lastStatus === "failed")
                          ? ` · ${new Date(job.lastRun).toLocaleString()}`
                          : "";
                      return (
                        <p className="mt-1 flex items-center gap-1.5 text-xs font-medium">
                          <span
                            className={`h-2 w-2 rounded-full shadow-[0_0_8px] ${meta.dot}`}
                          />
                          <span className={meta.text}>
                            {t(meta.labelKey as Parameters<typeof t>[0])}
                            {when}
                          </span>
                        </p>
                      );
                    })()}
                  </div>
                  <div className="flex gap-1">
                    {job.history && job.history.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${
                          openLog === job.id ? "text-accent" : ""
                        }`}
                        onClick={() =>
                          setOpenLog((cur) => (cur === job.id ? null : job.id))
                        }
                        title={t("settings.sync.log")}
                      >
                        <ScrollText className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRun(job.id)}
                      disabled={runningJob === job.id}
                    >
                      {runningJob === job.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-300"
                      onClick={() => handleDelete(job.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  </div>

                  {openLog === job.id && (
                    <div className="space-y-2 border-t border-line px-3 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        {t("settings.sync.log")}
                      </p>
                      {(job.history ?? []).map((e, i) => {
                        const meta =
                          STATUS_META[e.status] ?? STATUS_META.never;
                        return (
                          <div key={i} className="flex items-start gap-2">
                            <span
                              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full shadow-[0_0_8px] ${meta.dot}`}
                            />
                            <div className="min-w-0">
                              <p className={`text-xs font-medium ${meta.text}`}>
                                {t(meta.labelKey as Parameters<typeof t>[0])}
                                <span className="ml-1.5 font-normal text-slate-500">
                                  {new Date(e.time).toLocaleString()}
                                </span>
                              </p>
                              {e.detail && (
                                <p className="mt-0.5 break-words font-mono text-[11px] text-slate-500">
                                  {e.detail}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <BackupWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onComplete={loadJobs}
      />
    </>
  );
}
