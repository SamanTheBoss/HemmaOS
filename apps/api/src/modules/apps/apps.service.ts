import { writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { spawn } from "node:child_process";
import { shell } from "../../shared/lib/shell.js";
import { docker } from "../../shared/lib/docker.js";
import { AppError } from "../../shared/middleware/error-handler.js";
import { generateCaddyfile, reloadCaddy } from "../../shared/lib/caddy.js";
import { APP_DEFINITIONS } from "./apps.definitions.js";
import type {
  AppName,
  AppInstallRequest,
  AppControlRequest,
  AppControlResponse,
} from "./apps.types.js";

export interface InstallProgress {
  percent: number;
  status: "starting" | "downloading" | "extracting" | "configuring" | "done" | "error";
  done: boolean;
  error: string | null;
  url: string | null;
  port: number | null;
}

// Live install progress per app, updated by parsing `docker compose` output.
const installs = new Map<string, InstallProgress>();

export function getInstallProgress(app: string): InstallProgress | null {
  return installs.get(app) ?? null;
}

// Starts the install in the background and returns immediately. Large apps
// (WordPress, Nextcloud, Immich…) can take minutes to pull — far longer than a
// single shell timeout — so we spawn the process and stream its progress, which
// the UI polls via getInstallProgress().
export async function startInstall(
  payload: AppInstallRequest,
): Promise<{ started: boolean }> {
  const definition = APP_DEFINITIONS[payload.app];
  if (!definition) {
    throw new AppError(400, `Unknown app: ${payload.app}`, "UNKNOWN_APP");
  }

  const envContent = Object.entries(payload.env)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  await writeFile(`${dirname(definition.composeFile)}/.env`, envContent, "utf-8");

  const state: InstallProgress = {
    percent: 0,
    status: "starting",
    done: false,
    error: null,
    url: null,
    port: null,
  };
  installs.set(payload.app, state);

  const child = spawn("docker", [
    "compose",
    "-f",
    definition.composeFile,
    "up",
    "-d",
  ]);

  const layers = new Set<string>();
  const doneLayers = new Set<string>();

  function parse(chunk: string): void {
    for (const raw of chunk.split(/[\r\n]+/)) {
      const line = raw.trim();
      if (!line) continue;
      const id = line.split(/\s+/)[0] ?? "";
      if (/Pulling fs layer/.test(line)) layers.add(id);
      if (/Pull complete|Already exists/.test(line)) {
        layers.add(id);
        doneLayers.add(id);
      }
      if (/Downloading/.test(line)) state.status = "downloading";
      else if (/Extracting/.test(line)) state.status = "extracting";
      if (/Container .*(Creating|Created|Starting|Started|Running)/.test(line)) {
        state.status = "configuring";
      }
      const total = layers.size;
      const pct =
        total > 0
          ? Math.round((doneLayers.size / total) * 90)
          : state.status === "downloading"
            ? 20
            : 5;
      state.percent = Math.max(state.percent, Math.min(90, pct));
    }
  }

  child.stdout.on("data", (d) => parse(d.toString()));
  child.stderr.on("data", (d) => parse(d.toString()));

  child.on("close", (code) => {
    void (async () => {
      if (code === 0) {
        try {
          await updateCaddyRoutes();
        } catch {
          /* non-critical */
        }
        state.percent = 100;
        state.status = "done";
        state.done = true;
        state.url = `https://${process.env["TAILSCALE_DOMAIN"] ?? "localhost"}/${payload.app}`;
        state.port = definition.defaultPort;
      } else {
        state.status = "error";
        state.done = true;
        state.error = `docker compose exited with code ${code}`;
      }
    })();
  });

  child.on("error", (err) => {
    state.status = "error";
    state.done = true;
    state.error = err.message;
  });

  return { started: true };
}

export async function controlApp(
  payload: AppControlRequest,
): Promise<AppControlResponse> {
  const definition = APP_DEFINITIONS[payload.app];
  if (!definition) {
    throw new AppError(400, `Unknown app: ${payload.app}`, "UNKNOWN_APP");
  }

  const container = docker.getContainer(definition.containerName);

  switch (payload.action) {
    case "restart":
      await container.restart();
      break;
    case "stop":
      await container.stop();
      break;
    case "start":
      await container.start();
      break;
  }

  return { success: true };
}

export interface AppWithStatus {
  name: AppName;
  displayName: string;
  description: string;
  installed: boolean;
  running: boolean;
  url: string | null;
  /** The app's own port. The frontend opens http://<box-ip>:<port>. */
  port: number;
  envFields: { key: string; label: string; type: "text" | "password" }[];
}

export async function listApps(): Promise<AppWithStatus[]> {
  const tailscaleDomain = process.env["TAILSCALE_DOMAIN"] ?? "localhost";

  let containerStates: Map<string, string>;
  try {
    const containers = await docker.listContainers({ all: true });
    containerStates = new Map(
      containers.map((c) => [
        c.Names[0]?.replace(/^\//, "") ?? "",
        c.State,
      ]),
    );
  } catch {
    containerStates = new Map();
  }

  return Object.values(APP_DEFINITIONS).map((def) => {
    const state = containerStates.get(def.containerName);
    const installed = !!state;
    const running = state === "running";

    return {
      name: def.name,
      displayName: def.displayName,
      description: def.description,
      installed,
      running,
      // Kept for the Tailscale/Caddy path; the UI opens the direct port.
      url: installed ? `https://${tailscaleDomain}/${def.name}` : null,
      port: def.defaultPort,
      envFields: def.envFields,
    };
  });
}

export async function uninstallApp(app: AppName): Promise<{ success: true }> {
  const definition = APP_DEFINITIONS[app];
  if (!definition) {
    throw new AppError(400, `Unknown app: ${app}`, "UNKNOWN_APP");
  }

  // Stop and remove the app's containers (keeps the data volumes on disk).
  await shell(`docker compose -f ${definition.composeFile} down`);

  // Drop its reverse-proxy route now that it's gone.
  await updateCaddyRoutes();

  return { success: true };
}

/**
 * Regenerate Caddyfile with reverse proxy routes for all installed apps.
 */
async function updateCaddyRoutes(): Promise<void> {
  try {
    const containers = await docker.listContainers({ all: true });
    const containerNames = new Set(
      containers.map((c) => c.Names[0]?.replace(/^\//, "") ?? ""),
    );

    const routes = Object.values(APP_DEFINITIONS)
      .filter((def) => containerNames.has(def.containerName))
      .map((def) => ({
        path: def.proxyPath,
        // Caddy is a container on the shared network → reach the app by its
        // container name and the port it listens on *inside* the container.
        upstream: `http://${def.containerName}:${def.internalPort}`,
        extraHeaders: def.proxyHeaders,
      }));

    await generateCaddyfile(routes);
    await reloadCaddy();
  } catch {
    // Non-critical — don't fail the install if Caddy update fails
  }
}
