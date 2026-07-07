// The API runs on port 4000 on the *same box* that serves this dashboard.
// Deriving the base from the current URL means a browser on 192.168.1.126:3000
// talks to 192.168.1.126:4000 (the box) — not to whatever happens to run on the
// viewer's own localhost. An explicit NEXT_PUBLIC_API_URL still wins if set.
function resolveApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:4000`;
  }
  return "http://localhost:4000";
}

let authToken: string | null = null;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${resolveApiBase()}${path}`, {
    headers,
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      body?.error?.message ?? `Request failed: ${res.status}`,
    );
  }

  const json = await res.json();
  return json.data as T;
}

export const api = {
  setToken: (token: string | null) => {
    authToken = token;
  },

  // Auth
  authCheck: () =>
    request<{
      setupComplete: boolean;
      systemName: string | null;
      locale: string | null;
      timezone: string | null;
    }>("/api/auth/check"),

  setup: (data: {
    password: string;
    systemName: string;
    locale: string;
    timezone: string;
  }) =>
    request<{ token: string }>("/api/auth/setup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (password: string) =>
    request<{ token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),

  updateSettings: (data: {
    systemName?: string;
    locale?: string;
    timezone?: string;
  }) =>
    request<{ success: boolean }>("/api/auth/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  // System
  getSystemStatus: () =>
    request<{
      status: string;
      disk: { total: string; used: string; percent: number };
      ram: { percent: number };
      backup: { last_success: string; status: string };
    }>("/api/system/status"),

  reboot: () =>
    request<{ success: boolean }>("/api/system/reboot", { method: "POST" }),

  checkUpdate: () =>
    request<{
      current: string;
      latest: string | null;
      hasUpdate: boolean;
      changelog: string | null;
      url: string | null;
    }>("/api/system/update/check"),

  applyUpdate: () =>
    request<{ started: boolean }>("/api/system/update/apply", {
      method: "POST",
    }),

  // Downloads the config/keys archive as a Blob (binary, so not via request()).
  downloadConfigBackup: async (): Promise<Blob> => {
    const res = await fetch(`${resolveApiBase()}/api/system/backup/config`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    });
    if (!res.ok) throw new Error(`Backup failed: ${res.status}`);
    return res.blob();
  },

  // Apps
  listApps: () =>
    request<{
      apps: {
        name: string;
        displayName: string;
        description: string;
        installed: boolean;
        running: boolean;
        url: string | null;
        port: number;
        envFields: { key: string; label: string; type: "text" | "password" }[];
      }[];
    }>("/api/apps"),

  installApp: (app: string, env: Record<string, string>) =>
    request<{ success: boolean; url: string }>("/api/apps/install", {
      method: "POST",
      body: JSON.stringify({ app, env }),
    }),

  controlApp: (app: string, action: string) =>
    request<{ success: boolean }>("/api/apps/control", {
      method: "POST",
      body: JSON.stringify({ app, action }),
    }),

  uninstallApp: (app: string) =>
    request<{ success: boolean }>("/api/apps/uninstall", {
      method: "POST",
      body: JSON.stringify({ app }),
    }),

  // Support
  getSupportStatus: () =>
    request<{ configured: boolean }>("/api/system/support/status"),

  toggleSupport: (enabled: boolean) =>
    request<{ support_active: boolean }>("/api/system/support/toggle", {
      method: "POST",
      body: JSON.stringify({ enabled }),
    }),

  // Logs
  getContainers: () =>
    request<{
      containers: {
        id: string;
        name: string;
        state: string;
      }[];
    }>("/api/logs/containers"),

  getContainerLogs: (container: string, tail = 100) =>
    request<{ logs: string }>(`/api/logs/${container}?tail=${tail}`),

  streamLogsUrl: (container: string) =>
    // EventSource can't send an Authorization header, so pass the token as a
    // query param (the API accepts it there for this endpoint).
    `${resolveApiBase()}/api/logs/${container}/stream?token=${encodeURIComponent(
      authToken ?? "",
    )}`,

  // Backup
  getBackupJobs: () =>
    request<{
      jobs: {
        id: string;
        name: string;
        targetType: string;
        targetPath: string;
        sources: string[];
        schedule: string;
        lastRun: string | null;
        lastStatus: string;
        enabled: boolean;
      }[];
    }>("/api/backup/jobs"),

  createBackupJob: (data: {
    name: string;
    targetType: string;
    targetPath: string;
    sources: string[];
    schedule: string;
    rcloneConfig?: { token?: string };
  }) =>
    request<{
      success: boolean;
      job: { id: string; name: string };
    }>("/api/backup/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteBackupJob: (jobId: string) =>
    request<{ success: boolean }>(`/api/backup/jobs/${jobId}`, {
      method: "DELETE",
    }),

  runBackupJob: (jobId: string) =>
    request<{ success: boolean; message: string }>(
      `/api/backup/jobs/${jobId}/run`,
      { method: "POST" },
    ),

  getUsbDevices: () =>
    request<{
      devices: {
        name: string;
        path: string;
        size: string;
        mounted: boolean;
      }[];
    }>("/api/backup/usb-devices"),

  // Cloud provider OAuth (gdrive, dropbox, onedrive, box, pcloud)
  getCloudProviders: () =>
    request<{
      providers: { id: string; rcloneType: string; label: string }[];
    }>("/api/backup/cloud/providers"),

  startCloudAuth: (providerId: string) =>
    request<{ started: boolean; message: string }>(
      `/api/backup/cloud/auth/${providerId}`,
      { method: "POST" },
    ),

  getCloudAuthStatus: () =>
    request<{
      provider: string | null;
      authUrl: string | null;
      token: string | null;
      error: string | null;
      done: boolean;
      pending: boolean;
    }>("/api/backup/cloud/auth/status"),

  saveCloudToken: (providerId: string, token: string) =>
    request<{ success: boolean }>(
      `/api/backup/cloud/auth/${providerId}/token`,
      { method: "POST", body: JSON.stringify({ token }) },
    ),

  cancelCloudAuth: () =>
    request<{ success: boolean }>("/api/backup/cloud/auth", {
      method: "DELETE",
    }),

  // Tailscale
  getTailscaleStatus: () =>
    request<{
      installed: boolean;
      running: boolean;
      authenticated: boolean;
      hostname: string | null;
      ip: string | null;
    }>("/api/system/tailscale/status"),

  startTailscaleAuth: () =>
    request<{
      authUrl: string | null;
      alreadyAuthenticated: boolean;
    }>("/api/system/tailscale/auth", { method: "POST" }),

  stopTailscale: () =>
    request<{ success: boolean }>("/api/system/tailscale/stop", {
      method: "POST",
    }),
};
