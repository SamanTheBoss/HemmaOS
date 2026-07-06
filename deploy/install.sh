#!/usr/bin/env bash
set -euo pipefail

# HemmaOS Install Script
# Sets up the directory structure and copies app templates to the host

echo "=== HemmaOS Installation ==="

# Run from the deploy/ directory regardless of where the script was invoked,
# so the relative `apps/<app>/...` and `Caddyfile` copies resolve.
cd "$(dirname "$0")"

# Create the base directory structure
sudo mkdir -p /opt/home-os/{config,data,apps}

# Copy app compose templates
for app in immich jellyfin adguard vaultwarden audiobookshelf; do
  sudo mkdir -p "/opt/home-os/apps/$app"
  sudo cp "apps/$app/docker-compose.yml" "/opt/home-os/apps/$app/"
done

# Copy default Caddyfile
sudo cp Caddyfile /opt/home-os/config/Caddyfile

# Create data directories for each app
sudo mkdir -p /opt/home-os/data/{immich/upload,immich/db,immich/model-cache}
sudo mkdir -p /opt/home-os/data/{jellyfin/config,jellyfin/cache}
sudo mkdir -p /opt/home-os/data/{adguard/work,adguard/conf}
sudo mkdir -p /opt/home-os/data/vaultwarden
sudo mkdir -p /opt/home-os/data/{audiobookshelf/config,audiobookshelf/metadata}
sudo mkdir -p /opt/home-os/data/{media/audiobooks,media/podcasts}
sudo mkdir -p /opt/home-os/data/backup

# Create the Docker network if it doesn't exist
docker network create home-os 2>/dev/null || true

# Generate a random JWT secret if not already set
if [ ! -f /opt/home-os/config/.env ]; then
  JWT_SECRET=$(openssl rand -hex 32)
  echo "JWT_SECRET=$JWT_SECRET" | sudo tee /opt/home-os/config/.env > /dev/null
  echo "Generated JWT secret."
fi

echo ""
echo "=== Installation complete ==="
echo "Start HemmaOS with: docker compose -f docker-compose.yml up -d"
echo ""
