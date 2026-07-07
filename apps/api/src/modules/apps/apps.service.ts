import { writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { shell } from "../../shared/lib/shell.js";
import { docker } from "../../shared/lib/docker.js";
import { AppError } from "../../shared/middleware/error-handler.js";
import { generateCaddyfile, reloadCaddy } from "../../shared/lib/caddy.js";
import { APP_DEFINITIONS } from "./apps.definitions.js";
import type {
  AppName,
  AppInstallRequest,
  AppInstallResponse,
  AppControlRequest,
  AppControlResponse,
} from "./apps.types.js";

export async function installApp(
  payload: AppInstallRequest,
): Promise<AppInstallResponse> {
  const definition = APP_DEFINITIONS[payload.app];
  if (!definition) {
    throw new AppError(400, `Unknown app: ${payload.app}`, "UNKNOWN_APP");
  }

  const envContent = Object.entries(payload.env)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const envPath = `${dirname(definition.composeFile)}/.env`;
  await writeFile(envPath, envContent, "utf-8");

  await shell(
    `docker compose -f ${definition.composeFile} up -d`,
  );

  // Regenerate Caddyfile with routes for all installed apps
  await updateCaddyRoutes();

  const tailscaleDomain =
    process.env["TAILSCALE_DOMAIN"] ?? "localhost";
  const url = `https://${tailscaleDomain}/${payload.app}`;

  return { success: true, url };
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
