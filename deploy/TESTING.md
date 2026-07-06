# Testa Home_OS end-to-end (WSL2 + Docker Desktop)

Home_OS-backenden pratar med **Linux** (`df`, `free`), **Docker-socketen**
(`/var/run/docker.sock`), **Tailscale** och `sudo`. Inget av det finns på ren
Windows — därför testar vi i **WSL2 + Docker Desktop**, vilket ligger närmast den
riktiga hårdvaran (Raspberry Pi / mini-PC).

Guiden är i nivåer. Nivå 0–1 kräver ingen Docker. Nivå 2–3 är hela flödet.

---

## Nivå 0 — Enhetstester (ingen Docker, funkar redan på Windows)

```bash
pnpm install
pnpm --filter @home-os/api test     # 16 tester, mockar shell/docker
pnpm test                           # alla paket via turbo
pnpm build                          # typecheck + bygg fram/bak
```

Testar parsing (`df`/`free`), service-logik, backup-scheman. Snabbast för att
fånga regressioner.

---

## Nivå 1 — Bara frontend (design/klickflöden)

```bash
pnpm --filter @home-os/web dev      # http://localhost:3000
```

Utan API:t svarar anropen med fel, men du ser layout, vyer och navigation.
Bäst för att jobba med MuradiBox-designen. Vill du ha riktig data → nivå 2.

---

## Nivå 2 — Full stack i WSL2 (setup → dashboard → logs)

### Engångs-förberedelse
1. **Installera WSL2:** i PowerShell (admin) `wsl --install`, starta om.
2. **Docker Desktop:** installera → *Settings → Resources → WSL integration* →
   slå på för din distro. Verifiera i WSL: `docker ps` ska svara.
3. **Klona repot i WSL-filsystemet** (inte `/mnt/c/...` — dålig prestanda och
   socket-strul):
   ```bash
   git clone <repo> ~/home_os && cd ~/home_os
   ```

### Kör
```bash
# 1. Skapa host-strukturen + kopiera app-mallar + data-kataloger
bash deploy/install.sh          # skapar /opt/home-os/{config,data,apps}

# 2. Bygg och starta web + api (Caddy behövs inte i dev)
docker compose -f deploy/docker-compose.dev.yml up --build
```

Öppna **http://localhost:3000**. Flödet start-to-end:

| Steg | Vad du testar |
|------|---------------|
| **Setup-wizard** | Sätt lösenord + systemnamn → `auth.json` skapas i `/opt/home-os/config` |
| **Login** | Logga ut / in, fel lösenord ger svenskt fel |
| **Hem** | Storage- och RAM-kort läser riktig `df`/`free` från containern |
| **Appar** | Listan visar installerat/ej installerat via docker-socketen |
| **Inställningar → Loggar** | Väljer container, ser riktiga docker-loggar |

> `auth.json` ligger nu direkt på WSL-hosten (`/opt/home-os/config/auth.json`).
> Vill du börja om från setup: `sudo rm /opt/home-os/config/auth.json`.

---

## Nivå 3 — Installera en app på riktigt

Det här kör en riktig `docker compose up` genom socketen. Börja med den
lättaste appen (**Vaultwarden** = en container):

1. Gå till **Appar → Vaultwarden → Installera**.
2. Fyll i admin-lösenord i stepper-steg 1.
3. Steg 2 skriver `.env` till `/opt/home-os/apps/vaultwarden/` och kör
   `docker compose up -d`.
4. Verifiera på hosten:
   ```bash
   docker ps | grep vaultwarden
   ```
5. Nå appen direkt på **http://localhost:8080** (i dev går vi förbi Caddy).

Fungerar det → hela install-pipelinen (env-skrivning → compose → status)
är verifierad. AdGuard är näst lättast; Immich/Jellyfin drar stora images.

---

## Kända begränsningar i dev (förväntat, inte buggar)

| Funktion | Beteende i WSL2-dev | Varför |
|----------|---------------------|--------|
| **Fjärrsupport-toggle** | Fel / "ej konfigurerad" om ingen nyckel | Ingen `tailscale`-binär i containern; nyckeln sätts vid riktig install (se nedan) |
| **Fjärråtkomst (Tailscale)** | Visar "ej installerad" | Ingen tailscale i dev-containern |
| **Starta om Home_OS** | Gör inget / fejlar tyst | Ingen `sudo`/host-init i containern (bra — du vill inte starta om laptopen) |
| **"Öppna app"-knapp** | Länkar till `https://<tailscale-domän>/...` | Använd published port direkt i dev (t.ex. `:8080`) |
| **`df`/`free`-siffror** | Containerns vy, inte hostens | Host-metrics kräver host-mounts; testar bara UI:t |

Vill du testa **Fjärrsupport** på riktigt: lägg din Tailscale auth-key i env
och starta om stacken:
```bash
TAILSCALE_SUPPORT_KEY=tskey-auth-xxxx docker compose -f deploy/docker-compose.dev.yml up --build
```
(Support är **av som default** — se open source-modellen i `Claude.md`.)

---

## Städa upp

```bash
docker compose -f deploy/docker-compose.dev.yml down       # stoppa stacken
docker rm -f vaultwarden adguardhome 2>/dev/null || true   # ev. installerade appar
sudo rm -rf /opt/home-os                                    # nollställ allt state
```

---

## Nivå 4 — Riktig hårdvara

Det enda som testar `tailscale` + Caddy-HTTPS + `sudo` på riktigt är en
Ubuntu-VM eller Raspberry Pi / mini-PC:

```bash
bash deploy/install.sh
docker compose -f deploy/docker-compose.yml up -d   # inkl. Caddy på 80/443
```
