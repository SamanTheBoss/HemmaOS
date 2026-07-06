# HemmaOS

**Your family's private cloud, in a box at home.**

HemmaOS is a mobile-first, self-hosted home-server platform for non-technical
families. It replaces the monthly subscriptions to Google, Apple, Dropbox and the
rest with open-source apps that run **entirely on a small box in your home** —
your photos, passwords, documents and media never leave the house.

> **Privacy first.** By default the box is invisible from the internet: no open
> ports, no standing tunnel, no background cloud service phoning home. Nothing
> connects in until the family clicks a button — and it closes itself again.

- **UI language:** Swedish and English (defaults to English, switch instantly in Settings).
- **Repo:** [github.com/SamanTheBoss/HemmaOS](https://github.com/SamanTheBoss/HemmaOS)
- **License:** [CC BY-NC-SA 4.0](#license) — free for personal use, no commercial resale.

---

## Quick install (one line)

On a fresh Ubuntu Server box, run:

```bash
curl -fsSL https://raw.githubusercontent.com/SamanTheBoss/HemmaOS/main/bootstrap.sh | sudo bash
```

That's it. The script:

1. Installs Docker Engine + the Compose plugin if they're missing (and removes the
   `podman-docker` shim that hijacks `docker compose`).
2. Fetches HemmaOS to `/opt/hemmaos`.
3. Lays out the host directories and starts the whole stack.
4. Prints the dashboard address, e.g. `http://<box-ip>:3000`.

Open that address, complete the one-time setup (system name + password), and you're
running. Re-running the same command later updates an existing install in place.

> Prefer to inspect first? Clone the repo and run `bash deploy/install.sh` yourself.

### Requirements

- A 64-bit Linux box (Ubuntu Server 24.04 recommended) with Docker-capable CPU.
- A wired LAN connection and some disk for the family's data (an NVMe SSD is ideal).
- That's it — no domain, no router config. Remote access is optional and off by default.

### Forgot your password?

There is **no password-recovery button in the UI** on purpose — anyone on your home
network could press it. Resetting requires host access (SSH or physical), which is the
same trust boundary as everything else. On the box:

```bash
sudo bash /opt/hemmaos/deploy/reset-password.sh
```

Reload the dashboard and the setup wizard reappears so you can choose a new password.
Your data is untouched.

---

## The hardware: HemmaBox

HemmaOS runs on any Linux box, but it's designed for a specific appliance — **HemmaBox**:

- **Intel N150** (successor to the N100) — **fanless**, ~6 W, silent, nothing to
  collect dust or break in a customer's hallway.
- **Intel QuickSync + AV1** — hardware video transcoding so heavy films stream to a
  phone without the box choking.
- **Strategy:** barebones chassis sourced abroad, fitted with quality **DDR5 RAM** and
  **NVMe SSD** bought locally for warranty and fast support.
- **HDMI kiosk port** — plug the box straight into a TV/monitor and get the HemmaOS
  dashboard on screen, no computer required.

---

## Core features

- **Privacy by design.** All data stays on the box. No open ports by default.
- **On-demand remote support.** A short-lived, encrypted SSH tunnel (Tailscale) that is
  **off by default**. When the family needs help they press **"Enable Remote Support"**;
  a temporary tunnel opens so a technician can troubleshoot, and it auto-closes on a
  timer (default 1 hour). A doorbell, not a keyhole. *(The support control only appears
  when the operator has configured a support key.)*
- **Kiosk mode.** HDMI out shows the dashboard directly on a TV/monitor.
- **HemmaOS Cloud Vault (backup).** Optional add-on: data is encrypted locally on the box
  with a private key **before** it's sent to cloud backup. Lose the key and not even the
  operator can read it.
- **One-tap apps.** Install, open (on its real port, in a new tab) and uninstall apps from
  the dashboard — no terminal, no Docker knowledge.

---

## The app catalog

Instead of paying monthly subscriptions, families get open-source apps pre-packaged in
Docker and managed from the HemmaOS dashboard.

### Shipping now

| App | Replaces | What the family gets |
|-----|----------|----------------------|
| 📸 **Immich** | Google Photos / iCloud | Auto photo & video backup from every phone, face & object search, all stored on the box. |
| 🔑 **Vaultwarden** | 1Password / LastPass | A private password vault for the whole family, kept at home. |
| 🛡️ **AdGuard Home** | — | Network-wide ad & tracker blocking for every device in the house. |
| 🎬 **Jellyfin** | Netflix / Plex | The family's private media center, streamed to the TV. |
| 🎧 **Audiobookshelf** | Audible | Own audiobooks & podcasts with resume-where-you-left-off. |

### On the roadmap

☁️ **Nextcloud** (Dropbox/OneDrive) · 🏠 **Home Assistant** (smart home brain, fully
local) · 🎵 **Navidrome** (private Spotify) · 📝 **Stirling-PDF** (local Adobe Acrobat:
sign, split, merge PDFs) · 📥 **Transmission / qBittorrent** (background downloads, wired
to Jellyfin) · 📊 **Uptime Kuma** (status + push alerts when a disk fills or the net
drops) · 🌐 **WireGuard / Tailscale VPN** (reach your photos & files securely while away)
· 🗒️ **Memos** (fast local notes & shared recipes) · 🛡️ **Pi-hole** (AdGuard alternative).

---

## Architecture

```
[ Phone / Browser ] ──HTTPS (Tailscale/LAN)──> [ Caddy reverse proxy ]
                                                       │
                                   ┌───────────────────┴───────────────────┐
                                   ▼                                       ▼
                        [ Dashboard (Next.js) ] ──API──> [ Backend (Express) ]
                                                                 │  (Docker socket / CLI)
                                                                 ▼
                                                    [ App ecosystem (Docker) ]
                                                    Immich · Jellyfin · Vaultwarden · …
```

- **Frontend:** Next.js + Tailwind (ultra-dark, mobile-first dashboard).
- **Backend:** Node.js/Express, talks to the Docker socket and host tools.
- **Proxy:** Caddy for automated HTTPS via Tailscale.
- **Monorepo:** Turborepo + pnpm — `apps/web`, `apps/api`, `packages/shared`, `deploy/`.

---

## Development

```bash
pnpm install

# Unit tests (mock shell/docker — run on any OS, incl. Windows)
pnpm --filter @home-os/api test

# Frontend only, for design work
pnpm --filter @home-os/web dev        # http://localhost:3000

# Full end-to-end (WSL2 + Docker Desktop, or a Linux box)
bash deploy/install.sh
docker compose -f deploy/docker-compose.yml up -d --build
```

The backend shells out to Docker/Tailscale, so testing is tiered — see
[`deploy/TESTING.md`](deploy/TESTING.md) for the full walkthrough and known dev limits.

### Roadmap: from script to appliance

We ship in three levels of "plug-and-play":

1. **Level 1 — scripted install (now):** the one-line `bootstrap.sh` above.
2. **Level 2 — custom ISO:** an Ubuntu autoinstall (`user-data`) image that installs the
   OS unattended and runs the installer on first boot. Sit-and-wait setup.
3. **Level 3 — immutable appliance:** a dedicated, A/B-updatable OS image (Buildroot /
   rpm-ostree) with HemmaOS baked in.

---

## Contributing

HemmaOS is open source and contributions are welcome — bug reports, translations, new app
definitions, docs.

- **Report a bug / request a feature:** open an
  [issue](https://github.com/SamanTheBoss/HemmaOS/issues).
- **Ready-made app configs & guides:** [hemmaos.se](https://hemmaos.se) *(coming soon)*.
- **Send a change:** see [CONTRIBUTING.md](CONTRIBUTING.md).

Please keep all **UI copy in Swedish and English** (via `apps/web/src/lib/i18n.ts`) and
follow the design tokens in the existing components.

---

## License

**Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
(CC BY-NC-SA 4.0)** — see [LICENSE](LICENSE).

- ✅ **Free for personal use.** Individuals may run, study, modify and share the code.
- 🔗 **Attribution + ShareAlike.** Credit the project and share modifications under the
  same license.
- ⛔ **No commercial use.** Companies and competitors may **not** use these scripts for
  commercial purposes or sell their own boxes running this code.

© 2026 Saman Muradi.
