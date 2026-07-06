import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import { shell } from "../../shared/lib/shell.js";
import { AppError } from "../../shared/middleware/error-handler.js";
import { BACKUP_SOURCE_PATHS, BACKUP_JOBS_FILE } from "./backup.paths.js";
import type {
  BackupJob,
  BackupTargetType,
  CreateBackupJobRequest,
  UsbDevice,
  BackupSchedule,
} from "./backup.types.js";

const CLOUD_TARGETS: Set<string> = new Set([
  "gdrive",
  "dropbox",
  "onedrive",
  "box",
  "pcloud",
]);

function isCloudTarget(targetType: BackupTargetType): boolean {
  return CLOUD_TARGETS.has(targetType);
}

function buildSyncCommand(
  job: BackupJob,
  sourcePaths: string,
): string {
  if (isCloudTarget(job.targetType)) {
    // rclone remote name matches the provider id (configured via cloud auth)
    return `rclone sync ${sourcePaths} ${job.targetType}:${job.targetPath}`;
  }
  return `rsync -av --delete ${sourcePaths} ${job.targetPath}/hemmaos-backup/`;
}

async function loadJobs(): Promise<BackupJob[]> {
  try {
    const raw = await readFile(BACKUP_JOBS_FILE, "utf-8");
    return JSON.parse(raw) as BackupJob[];
  } catch {
    return [];
  }
}

async function saveJobs(jobs: BackupJob[]): Promise<void> {
  await mkdir(dirname(BACKUP_JOBS_FILE), { recursive: true });
  await writeFile(BACKUP_JOBS_FILE, JSON.stringify(jobs, null, 2), "utf-8");
}

function scheduleToCron(schedule: BackupSchedule): string | null {
  switch (schedule) {
    case "daily":
      return "0 3 * * *";
    case "weekly":
      return "0 3 * * 0";
    case "monthly":
      return "0 3 1 * *";
    case "manual":
      return null;
  }
}

async function installCronJob(job: BackupJob): Promise<void> {
  const cron = scheduleToCron(job.schedule);
  if (!cron) return;

  const sourcePaths = job.sources
    .map((s) => BACKUP_SOURCE_PATHS[s])
    .join(" ");

  const command = buildSyncCommand(job, sourcePaths);

  const cronLine = `${cron} ${command} >> /var/log/hemmaos-backup-${job.id}.log 2>&1`;
  const marker = `# hemmaos-backup-${job.id}`;

  await shell(
    `(crontab -l 2>/dev/null | grep -v "${marker}"; echo "${cronLine} ${marker}") | crontab -`,
  );
}

async function removeCronJob(jobId: string): Promise<void> {
  const marker = `# hemmaos-backup-${jobId}`;
  await shell(
    `crontab -l 2>/dev/null | grep -v "${marker}" | crontab -`,
  );
}

export async function getJobs(): Promise<BackupJob[]> {
  return loadJobs();
}

export async function createJob(
  request: CreateBackupJobRequest,
): Promise<BackupJob> {
  const jobs = await loadJobs();

  const job: BackupJob = {
    id: randomUUID(),
    name: request.name,
    targetType: request.targetType,
    targetPath: request.targetPath,
    sources: request.sources,
    schedule: request.schedule,
    lastRun: null,
    lastStatus: "never",
    enabled: true,
  };

  // Token is now handled by the cloud auth flow before job creation

  jobs.push(job);
  await saveJobs(jobs);
  await installCronJob(job);

  return job;
}

export async function deleteJob(jobId: string): Promise<void> {
  const jobs = await loadJobs();
  const idx = jobs.findIndex((j) => j.id === jobId);
  if (idx === -1) {
    throw new AppError(404, "Backup job not found", "JOB_NOT_FOUND");
  }

  await removeCronJob(jobId);
  jobs.splice(idx, 1);
  await saveJobs(jobs);
}

export async function runJob(jobId: string): Promise<string> {
  const jobs = await loadJobs();
  const job = jobs.find((j) => j.id === jobId);
  if (!job) {
    throw new AppError(404, "Backup job not found", "JOB_NOT_FOUND");
  }

  const sourcePaths = job.sources
    .map((s) => BACKUP_SOURCE_PATHS[s])
    .join(" ");

  const command = buildSyncCommand(job, sourcePaths);

  job.lastRun = new Date().toISOString();
  job.lastStatus = "running";
  await saveJobs(jobs);

  try {
    await shell(command);
    job.lastStatus = "success";
    await saveJobs(jobs);
    return "Backup slutförd";
  } catch (err) {
    job.lastStatus = "failed";
    await saveJobs(jobs);
    throw new AppError(500, "Backup misslyckades", "BACKUP_FAILED");
  }
}

export async function detectUsbDevices(): Promise<UsbDevice[]> {
  try {
    const { stdout } = await shell(
      "lsblk -J -o NAME,SIZE,MOUNTPOINT,TRAN",
    );
    const data = JSON.parse(stdout);
    const devices: UsbDevice[] = [];

    for (const dev of data.blockdevices ?? []) {
      if (dev.tran === "usb") {
        devices.push({
          name: dev.name,
          path: dev.mountpoint ?? `/dev/${dev.name}`,
          size: dev.size ?? "Okänd",
          mounted: !!dev.mountpoint,
        });
        for (const child of dev.children ?? []) {
          if (child.mountpoint) {
            devices.push({
              name: child.name,
              path: child.mountpoint,
              size: child.size ?? "Okänd",
              mounted: true,
            });
          }
        }
      }
    }

    return devices;
  } catch {
    return [];
  }
}
