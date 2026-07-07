import { readFile, statfs } from "node:fs/promises";
import os from "node:os";
import { shell } from "../../shared/lib/shell.js";
import { docker } from "../../shared/lib/docker.js";
import { APP_DEFINITIONS } from "../apps/apps.definitions.js";
import { BACKUP_JOBS_FILE } from "../backup/backup.paths.js";
import type { SystemStatusResponse } from "./system.types.js";

// Where the family's data lives. statfs() on this path reports the *host*
// filesystem it is bind-mounted from — the number that actually matters —
// instead of the container's ephemeral overlay layer.
const DATA_PATH = "/opt/hemmaos";

function formatGB(bytes: number): string {
  return `${Math.round(bytes / 1024 / 1024 / 1024)}GB`;
}

// Read disk usage directly from the filesystem — no shelling out to `df`,
// which is unreliable inside a minimal (busybox) container.
async function getDisk(): Promise<{
  total: string;
  used: string;
  percent: number;
}> {
  try {
    const stats = await statfs(DATA_PATH);
    const total = stats.blocks * stats.bsize;
    const free = stats.bavail * stats.bsize;
    const used = total - free;
    return {
      total: formatGB(total),
      used: formatGB(used),
      percent: total > 0 ? Math.round((used / total) * 1000) / 10 : 0,
    };
  } catch (err) {
    console.warn("system status: statfs failed:", err);
    return { total: "0GB", used: "0GB", percent: 0 };
  }
}

// RAM from os.* — reflects the host, no `free` binary required.
function getRam(): { percent: number } {
  const total = os.totalmem();
  if (total <= 0) return { percent: 0 };
  const used = total - os.freemem();
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
  const [disk, containerHealth, backup] = await Promise.all([
    getDisk(),
    getContainerHealth(),
    getBackupSummary(),
  ]);

  return {
    status: containerHealth,
    disk,
    ram: getRam(),
    backup,
  };
}

export async function reboot(): Promise<void> {
  // The API runs in a container, so `shutdown` here would only affect the
  // container. To reboot the *host*, spawn a one-shot privileged helper that
  // enters the host's namespaces (PID 1) and triggers the reboot. This works
  // through the mounted Docker socket without giving the API standing host
  // privileges. The nsenter1 image is tiny and pulled once.
  await shell(
    "docker run --rm --privileged --pid=host justincormack/nsenter1 /sbin/reboot",
  );
}
