# `deploy/` — how HemmaOS gets onto a box

Everything needed to run HemmaOS on real hardware: the Docker stack, the reverse
proxy, and the scripts that install, update, provision and maintain a box.

If you just want to install HemmaOS, use the one-liner in the
[root README](../README.md#quick-install-one-line) — it runs `bootstrap.sh` for
you. The rest of this document explains each piece.

---

## The stack

| File | What it is |
|------|------------|
| `docker-compose.yml` | The core stack: **web** (Next.js dashboard), **api** (Express backend), **caddy** (reverse proxy). Attaches to the shared external `hemmaos` Docker network. |
| `docker-compose.dev.yml` | Same stack wired for local development. |
| `Dockerfile.web` / `Dockerfile.api` | Container builds for the dashboard and backend. |
| `Caddyfile` | Reverse-proxy config. The backend rewrites it as apps are installed so each app is reachable under a clean path. |
| `apps/<app>/docker-compose.yml` | One template per installable app (Immich, Jellyfin, Vaultwarden, …). Each joins the external `hemmaos` network. Installing an app copies its template to `/opt/hemmaos/apps/<app>/` and runs `docker compose up -d`. |

---

## Install & lifecycle scripts

| Script | Run where | What it does |
|--------|-----------|--------------|
| **`bootstrap.sh`** | fresh box (via `curl … \| sudo bash`) | One-line installer. Fetches HemmaOS to `/opt/hemmaos` and runs `install.sh`. Safe to re-run — pulls the latest instead of re-cloning. |
| **`install.sh`** | on the box | Ensures Docker Engine + Compose are present (removes the `podman-docker` shim), sets up `hemmaos.local` via Avahi/mDNS, lays out `/opt/hemmaos/{config,data,apps}`, copies app templates, creates the `hemmaos` network, generates a JWT secret, and starts the core stack. |
| **`provision.sh`** | on someone else's box (once) | Provision a box for a friend/customer. Pins the box to the latest **release tag** (never raw `main`), installs Tailscale on the host and joins your **support tailnet** (then brings it **down** — remote support is off by default), installs your SSH public key from a USB stick, persists the support key to the gitignored `deploy/.env`, and runs `install.sh`. See the header of the script for the required env vars. |
| **`self-update.sh`** | on the box (auto) | Triggered by the dashboard's **"Apply update"** button. Fetches tags, checks out the newest `vX.Y.Z` **release** tag, and rebuilds. Boxes track releases, so a half-finished commit on `main` never reaches a box. |
| **`release.sh`** | your dev machine | Cut a release: bump the root `VERSION`, tag `vX.Y.Z`, push, and publish a GitHub Release with an auto-generated changelog. That Release is what "Check for updates" polls. Usage: `bash deploy/release.sh <patch\|minor\|major\|X.Y.Z>` (needs `gh` logged in). *There is also a GitHub Actions "Release" workflow that does the same from the Actions tab.* |
| **`migrate-from-hemmaserver.sh`** | on the box | Safely migrate an existing hand-rolled server into HemmaOS. **Never** touches or overwrites the source; copies media + app configs and `pg_dump`s the Immich database for a clean restore. |
| **`reset-password.sh`** | on the box (SSH/physical) | Removes the stored credential so the first-run setup wizard reappears and a new password can be chosen. No data is touched. (There is intentionally no password reset in the UI.) |

---

## Onboarding helpers (optional)

| Script | What it does |
|--------|--------------|
| **`kiosk-setup.sh`** | Boots the box straight into the dashboard on an attached HDMI screen — no desktop or keyboard. Uses `cage` + Chromium fullscreen via a systemd service. |
| **`wifi-setup.sh`** | Robot-vacuum-style WiFi onboarding. If the box has no network, it broadcasts a `HemmaBox-setup` WiFi; the user connects a phone, a captive portal opens, they pick their home WiFi, and the box joins it. |
| **`e2e-test.sh`** | End-to-end API smoke test against a running box: setup/login, roles, app catalog, install, child-account 403 checks. |
| **`fetch-assets.sh`** | Downloads app icons/assets into `apps/web/public/app-assets/`. |

---

## Testing

For the tiered testing story (unit tests on any OS → full end-to-end with real
Docker/Tailscale) and known dev limitations, see [`TESTING.md`](TESTING.md).

---

## Host layout

Everything the box keeps lives under `/opt/hemmaos`:

```
/opt/hemmaos
├── config/         # Caddyfile, .env (JWT secret), auth.json
├── data/           # per-app data + the family's media (immich/, jellyfin/, media/, …)
└── apps/           # installed apps' compose templates
```

`deploy/.env` (next to `docker-compose.yml`) holds host-specific secrets like
`TAILSCALE_SUPPORT_KEY`. It is **gitignored** and never committed.
