#!/usr/bin/env bash
set -euo pipefail

# ===========================================================================
# HemmaOS WiFi onboarding  (robot-vacuum style)
#
# Goal: a non-technical user with no ethernet cable can get the box online.
# If the box has no network connection, it broadcasts its own WiFi called
# "HemmaBox-setup". The user connects a phone to it, a captive-portal page
# opens, they pick their home WiFi + password, and the box joins that network
# (and stops its own AP).
#
#   sudo bash wifi-setup.sh
#
# This is host/hardware dependent (needs a WiFi adapter + NetworkManager) and
# must be tested on the real box. Two supported paths below.
# ===========================================================================

SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  SUDO="sudo"
fi

$SUDO apt-get update -y || true
$SUDO apt-get install -y network-manager || true
$SUDO systemctl enable --now NetworkManager 2>/dev/null || true

# --- Path A (recommended): comitup — AP fallback + captive portal, batteries included ---
# comitup automatically starts an AP with a captive portal when there is no
# connection, and switches to the chosen network. It ships for Debian/Raspberry
# Pi OS; on Ubuntu you may need to add its repo or install the .deb manually.
if $SUDO apt-get install -y comitup 2>/dev/null; then
  $SUDO tee /etc/comitup.conf >/dev/null <<'EOF'
# HemmaOS setup access point
ap_name: HemmaBox-<nnnn>
ap_password:
web_service: comitup-web.service
EOF
  $SUDO systemctl enable --now comitup 2>/dev/null || true
  $SUDO systemctl enable --now comitup-web 2>/dev/null || true
  echo "WiFi onboarding via comitup installed."
  echo "With no network, the box broadcasts 'HemmaBox-<nnnn>'. Connect a phone"
  echo "to it and pick your home WiFi at http://10.41.0.1"
  exit 0
fi

# --- Path B (fallback): a plain NetworkManager hotspot you can connect to ---
# No captive portal here — this just guarantees an AP named 'HemmaBox-setup'
# exists so you can reach the box over WiFi and finish setup. Pair it with a
# small setup web app to make it fully hands-off (the remaining piece to build).
echo "comitup not available — creating a NetworkManager hotspot fallback."
WIFI_DEV="$($SUDO nmcli -t -f DEVICE,TYPE device | awk -F: '$2=="wifi"{print $1; exit}')"
if [ -z "${WIFI_DEV:-}" ]; then
  echo "No WiFi adapter found — connect ethernet or add a WiFi dongle." >&2
  exit 1
fi

$SUDO nmcli connection delete "HemmaBox-setup" 2>/dev/null || true
$SUDO nmcli device wifi hotspot ifname "$WIFI_DEV" ssid "HemmaBox-setup" || true
echo "Hotspot 'HemmaBox-setup' is up on $WIFI_DEV."
echo "Connect and configure the home WiFi with:  nmcli device wifi connect \"<SSID>\" password \"<pass>\""
echo "TODO: add a captive-portal web app for a fully hands-off, no-terminal flow."
