#!/usr/bin/env bash
set -uo pipefail

# ===========================================================================
# HemmaOS end-to-end API smoke test
#
# Exercises the whole backend flow against a running box: setup/login, role,
# app catalog, installing an app, creating a child account, and confirming the
# child is blocked (403) from installing. Run it on the box (or point BASE at
# the box):
#
#   bash deploy/e2e-test.sh                     # uses http://localhost:4000
#   bash deploy/e2e-test.sh http://192.168.1.126:4000
#
# Password: reuses HEMMAOS_TEST_PASSWORD, or "testpass123" by default. On an
# already-set-up box it must match the real parent password (or login fails).
# ===========================================================================

BASE="${1:-http://localhost:4000}"
PASS="${HEMMAOS_TEST_PASSWORD:-testpass123}"
KIDPASS="kidpass123"
PASS_COUNT=0
FAIL_COUNT=0

ok()   { echo "  ✅ $1"; PASS_COUNT=$((PASS_COUNT + 1)); }
bad()  { echo "  ❌ $1"; FAIL_COUNT=$((FAIL_COUNT + 1)); }
field() { grep -oE "\"$1\":\"[^\"]*\"" | head -1 | sed -E "s/\"$1\":\"([^\"]*)\"/\1/"; }

echo "=== HemmaOS E2E against $BASE ==="

# 1. Stack reachable + setup state
CHECK="$(curl -fsS "$BASE/api/auth/check" 2>/dev/null || echo "")"
if [ -z "$CHECK" ]; then
  echo "❌ API not reachable at $BASE — is the stack up? (docker compose ps)"; exit 1
fi
ok "API reachable"

# 2. Setup (fresh) or login (existing)
if echo "$CHECK" | grep -q '"setupComplete":false'; then
  RES="$(curl -fsS -X POST "$BASE/api/auth/setup" -H 'Content-Type: application/json' \
    -d "{\"password\":\"$PASS\",\"systemName\":\"HemmaOS\",\"locale\":\"sv\",\"timezone\":\"Europe/Stockholm\"}")"
  ok "Fresh setup completed"
else
  RES="$(curl -fsS -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' \
    -d "{\"password\":\"$PASS\"}")"
  ok "Logged in to existing box"
fi
TOKEN="$(echo "$RES" | field token)"
[ -n "$TOKEN" ] && ok "Got parent token" || { bad "No token — wrong password?"; exit 1; }

# 3. /me → parent
ME="$(curl -fsS "$BASE/api/auth/me" -H "Authorization: Bearer $TOKEN")"
echo "$ME" | grep -q '"role":"parent"' && ok "/me reports parent" || bad "/me role not parent: $ME"

# 4. App catalog
APPS="$(curl -fsS "$BASE/api/apps" -H "Authorization: Bearer $TOKEN")"
echo "$APPS" | grep -q '"name":"immich"' && ok "App catalog loads" || bad "Catalog missing immich"

# 5. Install a small app (uptimekuma)
INST_CODE="$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/apps/install" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"app":"uptimekuma","env":{}}')"
[ "$INST_CODE" = "200" ] && ok "Parent can install (uptimekuma)" || bad "Install returned $INST_CODE"

# 6. Create a child account
ADD_CODE="$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/auth/users" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d "{\"name\":\"TestKid\",\"password\":\"$KIDPASS\",\"role\":\"child\"}")"
[ "$ADD_CODE" = "200" ] && ok "Parent added a child account" || bad "Add child returned $ADD_CODE"

# 7. Child logs in → child role
KIDRES="$(curl -fsS -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' -d "{\"password\":\"$KIDPASS\"}")"
KIDTOKEN="$(echo "$KIDRES" | field token)"
KIDME="$(curl -fsS "$BASE/api/auth/me" -H "Authorization: Bearer $KIDTOKEN")"
echo "$KIDME" | grep -q '"role":"child"' && ok "Child logs in with child role" || bad "Child role wrong: $KIDME"

# 8. Child is blocked from installing (403)
KID_INST="$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/apps/install" \
  -H "Authorization: Bearer $KIDTOKEN" -H 'Content-Type: application/json' -d '{"app":"memos","env":{}}')"
[ "$KID_INST" = "403" ] && ok "Child blocked from installing (403)" || bad "Child install returned $KID_INST (expected 403)"

echo ""
echo "=== $PASS_COUNT passed, $FAIL_COUNT failed ==="
[ "$FAIL_COUNT" -eq 0 ] && echo "🎉 End-to-end flow works." || echo "⚠️  Some checks failed — see above."
exit "$FAIL_COUNT"
