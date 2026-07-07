#!/usr/bin/env bash
set -euo pipefail

# HemmaOS Install Script
# Sets up the directory structure, ensures Docker is installed,
# copies app templates to the host and starts the stack.

echo "=== HemmaOS Installation ==="

# Run from the deploy/ directory regardless of where the script was invoked,
# so the relative `apps/<app>/...` and `Caddyfile` copies resolve.
cd "$(dirname "$0")"

# ---------------------------------------------------------------------------
# 0. Ensure Docker Engine + Compose plugin are available
#
# Some minimal server images ship `podman-docker`, which aliases `docker`
# to podman. That shim does NOT understand `docker compose` and rejects the
# `-f` flag ("unknown shorthand flag: 'f'"), so we must install real Docker CE.
# ---------------------------------------------------------------------------

# Prefer sudo when not already root.
SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  SUDO="sudo"
fi

has_docker_compose() {
  command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1
}

install_docker() {
  echo "Docker med compose-plugin saknas — installerar Docker CE..."

  # The podman-docker shim hijacks the `docker` command and lacks `compose`.
  # Remove it first so the real Docker CLI wins.
  if command -v apt-get >/dev/null 2>&1; then
    if dpkg -l 2>/dev/null | grep -qE '^ii\s+podman-docker'; then
      echo "Tar bort podman-docker (krockar med Docker CE)..."
      $SUDO apt-get remove -y podman-docker || true
    fi
    $SUDO apt-get update -y || true
    $SUDO apt-get install -y curl ca-certificates || true
  fi

  # Official convenience script installs docker-ce + docker-compose-plugin
  # for all supported distros (Debian/Ubuntu/Fedora/CentOS...).
  curl -fsSL https://get.docker.com | $SUDO sh

  # Enable and start the daemon (no-op on systems without systemd).
  $SUDO systemctl enable --now docker 2>/dev/null || true
}

if ! has_docker_compose; then
  install_docker
fi

if ! has_docker_compose; then
  echo "FEL: 'docker compose' är fortfarande inte tillgängligt efter installationen." >&2
  echo "Kontrollera Docker-installationen manuellt (docker compose version) och kör om skriptet." >&2
  exit 1
fi

echo "Docker OK: $(docker --version)"
echo "Compose OK: $(docker compose version | head -n1)"

# ---------------------------------------------------------------------------
# 0b. mDNS — make the box reachable as http://hemmaos.local (no IP needed)
#
# Publishes `hemmaos.local` via Avahi WITHOUT changing the system hostname,
# so users never have to find or type an IP address.
# ---------------------------------------------------------------------------
if command -v apt-get >/dev/null 2>&1; then
  $SUDO apt-get install -y avahi-daemon avahi-utils smartmontools || true
  if [ -f /etc/avahi/avahi-daemon.conf ]; then
    if grep -qE '^\s*#?\s*host-name=' /etc/avahi/avahi-daemon.conf; then
      $SUDO sed -i 's/^\s*#\?\s*host-name=.*/host-name=hemmaos/' /etc/avahi/avahi-daemon.conf
    else
      echo "host-name=hemmaos" | $SUDO tee -a /etc/avahi/avahi-daemon.conf > /dev/null
    fi
    $SUDO systemctl enable --now avahi-daemon 2>/dev/null || true
    $SUDO systemctl restart avahi-daemon 2>/dev/null || true
    echo "mDNS: dashboard reachable at http://hemmaos.local (once Caddy is on port 80)"
  fi
fi

# ---------------------------------------------------------------------------
# 1. Directory structure and templates
# ---------------------------------------------------------------------------

# Create the base directory structure
$SUDO mkdir -p /opt/hemmaos/{config,data,apps}

# Copy app compose templates
for app in immich jellyfin adguard vaultwarden audiobookshelf wordpress; do
  $SUDO mkdir -p "/opt/hemmaos/apps/$app"
  $SUDO cp "apps/$app/docker-compose.yml" "/opt/hemmaos/apps/$app/"
done

# Copy default Caddyfile
$SUDO cp Caddyfile /opt/hemmaos/config/Caddyfile

# Create data directories for each app
$SUDO mkdir -p /opt/hemmaos/data/{immich/upload,immich/db,immich/model-cache}
$SUDO mkdir -p /opt/hemmaos/data/{jellyfin/config,jellyfin/cache}
$SUDO mkdir -p /opt/hemmaos/data/{adguard/work,adguard/conf}
$SUDO mkdir -p /opt/hemmaos/data/vaultwarden
$SUDO mkdir -p /opt/hemmaos/data/{audiobookshelf/config,audiobookshelf/metadata}
$SUDO mkdir -p /opt/hemmaos/data/{media/audiobooks,media/podcasts}
$SUDO mkdir -p /opt/hemmaos/data/{wordpress/html,wordpress/db}
$SUDO mkdir -p /opt/hemmaos/data/backup

# Create the Docker network if it doesn't exist
$SUDO docker network create hemmaos 2>/dev/null || true

# Generate a random JWT secret if not already set
if [ ! -f /opt/hemmaos/config/.env ]; then
  JWT_SECRET=$(openssl rand -hex 32)
  echo "JWT_SECRET=$JWT_SECRET" | $SUDO tee /opt/hemmaos/config/.env > /dev/null
  echo "Generated JWT secret."
fi

# ---------------------------------------------------------------------------
# 2. Start the stack
# ---------------------------------------------------------------------------

echo ""
echo "Startar HemmaOS (docker compose up -d)..."
$SUDO docker compose -f docker-compose.yml up -d

echo ""
echo "=== Installation complete ==="
echo "HemmaOS körs nu. Öppna dashboarden och slutför uppsättningen i webbläsaren."
echo ""
