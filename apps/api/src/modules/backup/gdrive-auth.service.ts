import { spawn } from "node:child_process";
import { shell } from "../../shared/lib/shell.js";

export interface CloudProvider {
  id: string;
  rcloneType: string;
  label: string;
}

export const CLOUD_PROVIDERS: CloudProvider[] = [
  { id: "gdrive", rcloneType: "drive", label: "Google Drive" },
  { id: "dropbox", rcloneType: "dropbox", label: "Dropbox" },
  { id: "onedrive", rcloneType: "onedrive", label: "OneDrive" },
  { id: "box", rcloneType: "box", label: "Box" },
  { id: "pcloud", rcloneType: "pcloud", label: "pCloud" },
];

interface AuthSession {
  provider: string;
  authUrl: string | null;
  token: string | null;
  error: string | null;
  done: boolean;
}

let currentSession: AuthSession | null = null;
let currentProcess: ReturnType<typeof spawn> | null = null;

export function getProviders(): CloudProvider[] {
  return CLOUD_PROVIDERS;
}

export function startCloudAuth(
  providerId: string,
): { started: boolean; message: string } {
  const provider = CLOUD_PROVIDERS.find((p) => p.id === providerId);
  if (!provider) {
    return { started: false, message: `Unknown provider: ${providerId}` };
  }

  if (currentProcess) {
    return { started: false, message: "Auth session already in progress" };
  }

  currentSession = {
    provider: providerId,
    authUrl: null,
    token: null,
    error: null,
    done: false,
  };

  const proc = spawn("rclone", ["authorize", provider.rcloneType], {
    stdio: ["pipe", "pipe", "pipe"],
  });
  currentProcess = proc;

  let stdout = "";
  let stderr = "";

  proc.stdout.on("data", (chunk: Buffer) => {
    const text = chunk.toString();
    stdout += text;
    extractAuthUrl(text);
    extractToken(stdout);
  });

  proc.stderr.on("data", (chunk: Buffer) => {
    const text = chunk.toString();
    stderr += text;
    extractAuthUrl(text);
  });

  proc.on("close", (code) => {
    // One more check on combined output for the token
    extractToken(stdout + stderr);
    if (currentSession && !currentSession.done) {
      if (code !== 0) {
        currentSession.error = "Autentiseringen misslyckades";
      }
      currentSession.done = true;
    }
    currentProcess = null;
  });

  proc.on("error", (err) => {
    if (currentSession) {
      currentSession.error = err.message;
      currentSession.done = true;
    }
    currentProcess = null;
  });

  return { started: true, message: `Auth session started for ${provider.label}` };
}

function extractAuthUrl(text: string) {
  if (!currentSession || currentSession.authUrl) return;
  // Rclone prints an http URL for the user to visit
  const urlMatch = text.match(/(https?:\/\/\S+)/);
  if (urlMatch) {
    currentSession.authUrl = urlMatch[1];
  }
}

function extractToken(fullOutput: string) {
  if (!currentSession || currentSession.token) return;
  // Rclone prints the token JSON between marker text
  const tokenMatch = fullOutput.match(
    /Paste the following into your remote machine[\s\S]*?(\{[\s\S]*?"type"\s*:\s*"[^"]+[\s\S]*?\})/,
  );
  if (tokenMatch) {
    currentSession.token = tokenMatch[1].trim();
    currentSession.done = true;
  }
}

export function getAuthStatus(): {
  provider: string | null;
  authUrl: string | null;
  token: string | null;
  error: string | null;
  done: boolean;
  pending: boolean;
} {
  if (!currentSession) {
    return {
      provider: null,
      authUrl: null,
      token: null,
      error: null,
      done: false,
      pending: false,
    };
  }
  return {
    ...currentSession,
    pending: !currentSession.done,
  };
}

export async function saveCloudToken(
  providerId: string,
  token: string,
): Promise<void> {
  const provider = CLOUD_PROVIDERS.find((p) => p.id === providerId);
  if (!provider) return;

  const escapedToken = token.replace(/'/g, "'\\''");
  await shell(
    `rclone config create ${providerId} ${provider.rcloneType} token '${escapedToken}'`,
  );

  currentSession = null;
  if (currentProcess) {
    currentProcess.kill();
    currentProcess = null;
  }
}

export function cancelAuth(): void {
  if (currentProcess) {
    currentProcess.kill();
    currentProcess = null;
  }
  currentSession = null;
}
