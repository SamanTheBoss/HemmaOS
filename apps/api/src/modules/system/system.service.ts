import { readFile } from "node:fs/promises";
import { shell } from "../../shared/lib/shell.js";
import { docker } from "../../shared/lib/docker.js";
import { APP_DEFINITIONS } from "../apps/apps.definitions.js";
import { BACKUP_JOBS_FILE } from "../backup/backup.paths.js";
import type { SystemStatusResponse } from "./system.types.js";

function parseDfOutput(stdout: string): {
  total: string;
  used: string;
  percent: number;
} {
  const lines = stdout.split("\n").slice(1);
  let totalBytes = 0;
  let usedBytes = 0;

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 4) continue;
    const size = parseInt(parts[1], 10);
    const used = parseInt(parts[2], 10);
    if (isNaN(size) || isNaN(used)) continue;
    totalBytes += size;
    usedBytes += used;
  }

  const totalGB = Math.round(totalBytes / 1024 / 1024);
  const usedGB = Math.round(usedBytes / 1024 / 1024);
  const percent =
    totalBytes > 0
      ? Math.round((usedBytes / totalBytes) * 1000) / 10
      : 0;

  return {
    total: `${totalGB}GB`,
    used: `${usedGB}GB`,
    percent,
  };
}

function parseMemOutput(stdout: string): { percent: number } {
  const lines = stdout.split("\n");
  const memLine = lines.find((l) => l.startsWith("Mem:"));
  if (!memLine) return { percent: 0 };

  const parts = memLine.trim().split(/\s+/);
  const total = parseInt(parts[1], 10);
  const used = parseInt(parts[2], 10);

  if (isNaN(total) || isNaN(used) || total === 0) return { percent: 0 };

  return { percent: Math.round((used / total) * 100) };
}

async function getBackupSummary(): Promise<{
  last_success: string;
  status: "OK" | "FAILED" | "UNKNOWN";
}> {
  try {
    const raw = await readFile(BACKUP_JOBS_FILE, "utf-8");
    const jobs = JSON.parse(raw) as {
      lastRun: string | null;
      lastStatus: string;
      enabled: boolean;
    }[];

    // Only consider enabled jobs with external targets (those that actually run)
    const activeJobs = jobs.filter((j) => j.enabled);
    if (activeJobs.length === 0) {
      return { last_success: "Ingen extra backup konfigurerad", status: "UNKNOWN" };
    }

    // Find the most recent successful run
    const successes = activeJobs
      .filter((j) => j.lastStatus === "success" && j.lastRun)
      .sort((a, b) => (b.lastRun! > a.lastRun! ? 1 : -1));

    if (successes.length > 0) {
      const date = new Date(successes[0].lastRun!);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const time = date.toLocaleTimeString("sv-SE", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const label = isToday ? `Idag ${time}` : date.toLocaleDateString("sv-SE");
      return { last_success: label, status: "OK" };
    }

    const hasFailed = activeJobs.some((j) => j.lastStatus === "failed");
    if (hasFailed) {
      return { last_success: "Senaste backup misslyckades", status: "FAILED" };
    }

    return { last_success: "Ingen backup har körts ännu", status: "UNKNOWN" };
  } catch {
    return { last_success: "Ingen extra backup konfigurerad", status: "UNKNOWN" };
  }
}

async function getContainerHealth(): Promise<"HEALTHY" | "DEGRADED" | "UNHEALTHY"> {
  try {
    const managedNames = new Set(
      Object.values(APP_DEFINITIONS).map((d) => d.containerName),
    );
    const containers = await docker.listContainers({ all: true });

    const managed = containers.filter((c) =>
      c.Names.some((n) => managedNames.has(n.replace(/^\//, ""))),
    );

    if (managed.length === 0) return "HEALTHY"; // no apps installed yet

    const running = managed.filter((c) => c.State === "running").length;
    if (running === managed.length) return "HEALTHY";
    if (running === 0) return "UNHEALTHY";
    return "DEGRADED";
  } catch {
    // Docker not available — still report healthy for the host itself
    return "HEALTHY";
  }
}

export async function getSystemStatus(): Promise<SystemStatusResponse> {
  const [dfResult, memResult, containerHealth, backup] = await Promise.all([
    shell("df -k --total"),
    shell("free -m"),
    getContainerHealth(),
    getBackupSummary(),
  ]);

  const disk = parseDfOutput(dfResult.stdout);
  const ram = parseMemOutput(memResult.stdout);

  return {
    status: containerHealth,
    disk,
    ram,
    backup,
  };
}

export async function reboot(): Promise<void> {
  await shell("sudo shutdown -r now");
}
