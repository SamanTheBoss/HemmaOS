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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackupWizard } from "./backup-wizard";
import { api } from "@/lib/api";

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
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  failed: <XCircle className="h-4 w-4 text-red-400" />,
  running: <Loader2 className="h-4 w-4 text-accent animate-spin" />,
  never: <Clock className="h-4 w-4 text-slate-600" />,
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
  const [jobs, setJobs] = useState<BackupJob[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [runningJob, setRunningJob] = useState<string | null>(null);

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
              <CardTitle>Synkronisering</CardTitle>
            </div>
            <Button size="sm" onClick={() => setWizardOpen(true)}>
              <Plus className="h-4 w-4" />
              Ny
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              Inga synkjobb konfigurerade. Tryck &quot;Ny&quot; för att börja.
            </p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center gap-3 rounded-xl border border-line bg-white/[.02] p-3"
                >
                  {STATUS_ICONS[job.lastStatus] ?? STATUS_ICONS.never}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {job.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {TARGET_LABELS[job.targetType] ?? job.targetType} &middot;{" "}
                      {SCHEDULE_LABELS[job.schedule] ?? job.schedule}
                    </p>
                  </div>
                  <div className="flex gap-1">
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
