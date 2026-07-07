#!/usr/bin/env bash
set -euo pipefail

# ===========================================================================
# HemmaOS kiosk mode
#
# Boots the box straight into the HemmaOS dashboard on an attached HDMI screen —
# no desktop, no keyboard needed. Uses `cage` (a tiny kiosk compositor) running
# Chromium fullscreen, started by a systemd service on boot.
#
#   sudo bash kiosk-setup.sh
#   sudo reboot
#
# Disable later with:  sudo systemctl disable --now hemmaos-kiosk
# ===========================================================================

SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  SUDO="sudo"
fi

# Where the dashboard lives (Caddy on :80 via mDNS, or the web port directly).
URL="${HEMMAOS_KIOSK_URL:-http://localhost:3000}"

if command -v apt-get >/dev/null 2>&1; then
  $SUDO apt-get update -y || true
  # cage = minimal kiosk compositor; try both chromium package names.
  $SUDO apt-get install -y cage || true
  $SUDO apt-get install -y chromium || $SUDO apt-get install -y chromium-browser || true
fi

CHROMIUM="$(command -v chromium || command -v chromium-browser || echo /usr/bin/chromium)"

$SUDO tee /etc/systemd/system/hemmaos-kiosk.service >/dev/null <<EOF
[Unit]
Description=HemmaOS Kiosk (dashboard on attached screen)
After=network-online.target
Wants=network-online.target

[Service]
User=root
Environment=XDG_RUNTIME_DIR=/run/hemmaos-kiosk
ExecStartPre=/bin/mkdir -p /run/hemmaos-kiosk
ExecStart=/usr/bin/cage -- ${CHROMIUM} --kiosk --noerrdialogs --disable-infobars --no-first-run --check-for-update-interval=31536000 --app=${URL}
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

$SUDO systemctl daemon-reload
$SUDO systemctl enable hemmaos-kiosk.service 2>/dev/null || true

echo ""
echo "Kiosk installed. Reboot to boot straight into the dashboard on the screen:"
echo "  sudo reboot"
echo "URL: ${URL}"
echo "Disable with: sudo systemctl disable --now hemmaos-kiosk"
