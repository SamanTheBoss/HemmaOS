import { readFile, writeFile } from "node:fs/promises";
import { shell } from "./shell.js";

const CADDYFILE_PATH = "/opt/hemmaos/config/Caddyfile";

interface RouteEntry {
  path: string;
  upstream: string;
  extraHeaders?: Record<string, string>;
}

/**
 * Generates a Caddyfile with reverse proxy routes for all installed apps.
 * Called after each app install to add the new route, then reloads Caddy.
 */
export async function generateCaddyfile(
  routes: RouteEntry[],
  domain?: string,
): Promise<void> {
  const host = domain ?? process.env["TAILSCALE_DOMAIN"] ?? "localhost";

  const routeBlocks = routes
    .map((r) => {
      const headers = r.extraHeaders
        ? Object.entries(r.extraHeaders)
            .map(([k, v]) => `        header_up ${k} ${v}`)
            .join("\n")
        : "";
      return `    handle_path /${r.path}* {
        reverse_proxy ${r.upstream}${headers ? "\n" + headers : ""}
    }`;
    })
    .join("\n\n");

  const caddyfile = `{
    email info@home-os.se
}

${host} {
    # Frontend Dashboard
    handle {
        reverse_proxy http://localhost:3000
    }

${routeBlocks}
}
`;

  await writeFile(CADDYFILE_PATH, caddyfile, "utf-8");
}

/**
 * Reload Caddy to pick up config changes.
 */
export async function reloadCaddy(): Promise<void> {
  try {
    await shell("caddy reload --config /opt/hemmaos/config/Caddyfile");
  } catch {
    // Caddy might not be running yet in dev — ignore
  }
}

/**
 * Read current routes from the Caddyfile to avoid duplicates.
 */
export async function getCurrentRoutes(): Promise<RouteEntry[]> {
  try {
    const content = await readFile(CADDYFILE_PATH, "utf-8");
    const routes: RouteEntry[] = [];
    const regex = /handle_path\s+\/(\S+)\*\s*\{[\s\S]*?reverse_proxy\s+(\S+)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      routes.push({ path: match[1], upstream: match[2] });
    }
    return routes;
  } catch {
    return [];
  }
}
