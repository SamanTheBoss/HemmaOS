import { spawn } from "node:child_process";
import { shell } from "../../shared/lib/shell.js";

export interface TailscaleStatus {
  installed: boolean;
  running: boolean;
  authenticated: boolean;
  hostname: string | null;
  ip: string | null;
}

export async function getStatus(): Promise<TailscaleStatus> {
  try {
    const { stdout } = await shell("tailscale status --json");
    const data = JSON.parse(stdout);

    const selfKey = data.Self?.DNSName ?? null;
    const hostname = selfKey ? selfKey.replace(/\.$/, "") : null;
    const ip = data.TailscaleIPs?.[0] ?? data.Self?.TailscaleIPs?.[0] ?? null;

    return {
      installed: true,
      running: data.BackendState === "Running",
      authenticated: data.BackendState === "Running",
      hostname,
      ip,
    };
  } catch (err) {
    // Check if tailscale binary exists at all
    try {
      await shell("which tailscale");
      return {
        installed: true,
        running: false,
        authenticated: false,
        hostname: null,
        ip: null,
      };
    } catch {
      return {
        installed: false,
        running: false,
        authenticated: false,
        hostname: null,
        ip: null,
      };
    }
  }
}

export async function startAuth(): Promise<{
  authUrl: string | null;
  alreadyAuthenticated: boolean;
}> {
  // Check if already authenticated
  const status = await getStatus();
  if (status.authenticated) {
    return { authUrl: null, alreadyAuthenticated: true };
  }

  return new Promise((resolve) => {
    const proc = spawn("sudo", ["tailscale", "up"], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let resolved = false;
    let stderr = "";

    function tryResolve(text: string) {
      if (resolved) return;
      // Tailscale prints the auth URL to stderr
      const urlMatch = text.match(/(https:\/\/login\.tailscale\.com\/\S+)/);
      if (urlMatch) {
        resolved = true;
        resolve({ authUrl: urlMatch[1], alreadyAuthenticated: false });
      }
    }

    proc.stdout.on("data", (chunk: Buffer) => {
      tryResolve(chunk.toString());
    });

    proc.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      stderr += text;
      tryResolve(text);
    });

    proc.on("close", () => {
      if (!resolved) {
        // If no URL was found, it may already be authenticated
        resolve({ authUrl: null, alreadyAuthenticated: true });
      }
    });

    proc.on("error", () => {
      if (!resolved) {
        resolve({ authUrl: null, alreadyAuthenticated: false });
      }
    });

    // Timeout after 15 seconds
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        proc.kill();
        resolve({ authUrl: null, alreadyAuthenticated: false });
      }
    }, 15_000);
  });
}

export async function stop(): Promise<void> {
  await shell("sudo tailscale down");
}
