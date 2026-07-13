import { readFile } from "node:fs/promises";
import { shell } from "../../shared/lib/shell.js";

const REPO = "SamanTheBoss/HemmaOS";
const VERSION_FILE = "/opt/hemmaos/VERSION";
const FALLBACK_VERSION = "0.1.0";

export interface UpdateInfo {
  current: string;
  latest: string | null;
  hasUpdate: boolean;
  changelog: string | null;
  url: string | null;
}

export async function getCurrentVersion(): Promise<string> {
  try {
    const v = (await readFile(VERSION_FILE, "utf-8")).trim();
    return v || FALLBACK_VERSION;
  } catch {
    return FALLBACK_VERSION;
  }
}

// Compare dotted versions: is `a` newer than `b`?
function isNewer(a: string, b: string): boolean {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x > y) return true;
    if (x < y) return false;
  }
  return false;
}

export async function checkForUpdate(): Promise<UpdateInfo> {
  const current = await getCurrentVersion();
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/releases/latest`,
      { headers: { Accept: "application/vnd.github+json", "User-Agent": "HemmaOS" } },
    );
    if (!res.ok) {
      return { current, latest: null, hasUpdate: false, changelog: null, url: null };
    }
    const data = (await res.json()) as {
      tag_name?: string;
      body?: string;
      html_url?: string;
    };
    const latest = (data.tag_name ?? "").replace(/^v/, "") || null;
    return {
      current,
      latest,
      hasUpdate: !!latest && isNewer(latest, current),
      changelog: data.body ?? null,
      url: data.html_url ?? null,
    };
  } catch {
    return { current, latest: null, hasUpdate: false, changelog: null, url: null };
  }
}

export interface CurrentRelease {
  version: string;
  changelog: string | null;
  url: string | null;
}

// Release notes for the version the box is *currently* running. After an update
// the box == latest, so checkForUpdate() reports no changelog; this fetches the
// notes by tag so the dashboard can show a "what's new" popup post-update.
export async function getCurrentReleaseNotes(): Promise<CurrentRelease> {
  const current = await getCurrentVersion();
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/releases/tags/v${current}`,
      { headers: { Accept: "application/vnd.github+json", "User-Agent": "HemmaOS" } },
    );
    if (!res.ok) return { version: current, changelog: null, url: null };
    const data = (await res.json()) as { body?: string; html_url?: string };
    return {
      version: current,
      changelog: data.body ?? null,
      url: data.html_url ?? null,
    };
  } catch {
    return { version: current, changelog: null, url: null };
  }
}

export async function applyUpdate(): Promise<void> {
  // The update rebuilds and restarts the api/web containers, so it can't run
  // *inside* the api container (it would kill itself mid-way). Launch a detached
  // privileged helper that runs the versioned self-update script in the host's
  // namespaces instead.
  //
  // The script is copied to /tmp first so that when it `git checkout`s a new
  // release tag, the still-running shell isn't reading from a file that just
  // changed underneath it.
  const cmd =
    "cp /opt/hemmaos/deploy/self-update.sh /tmp/hemmaos-selfupdate.sh && " +
    "bash /tmp/hemmaos-selfupdate.sh";
  await shell(
    `docker run -d --rm --privileged --pid=host justincormack/nsenter1 sh -c "${cmd}"`,
  );
}
