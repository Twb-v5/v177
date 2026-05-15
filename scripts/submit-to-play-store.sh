#!/usr/bin/env bash
# =============================================================================
# submit-to-play-store.sh — Submit a built AAB to Google Play via EAS
# =============================================================================
# Usage (run from repo root):
#   ./scripts/submit-to-play-store.sh              # submits latest production build
#   ./scripts/submit-to-play-store.sh <build-id>   # submits a specific EAS build ID
#
# Requirements:
#   1. EXPO_TOKEN must be set in Replit Secrets
#   2. artifacts/tawbah-mobile/google-play-key.json must exist
#
# How to get google-play-key.json:
#   1. Open https://play.google.com/console → Setup → API access
#   2. Link to a Google Cloud project (or create one)
#   3. Create a service account with "Release manager" role
#   4. Download the JSON key for that service account
#   5. Place the downloaded file at: artifacts/tawbah-mobile/google-play-key.json
#
# EAS account: aiservx1
# Play Store track: internal
# =============================================================================
set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MOBILE_DIR="$REPO_ROOT/artifacts/tawbah-mobile"
BUILD_DIR="/tmp/tawbah-eas-build"
KEY_FILE="$MOBILE_DIR/google-play-key.json"

# ── 1. Validate prerequisites ─────────────────────────────────────────────────

if [ -z "$EXPO_TOKEN" ]; then
  echo ""
  echo "❌ EXPO_TOKEN is not set."
  echo "   Add it in Replit Secrets (lock icon in sidebar)."
  echo "   Get your token: https://expo.dev/accounts/aiservx1/settings/access-tokens"
  echo ""
  exit 1
fi

if [ ! -f "$KEY_FILE" ]; then
  echo ""
  echo "❌ google-play-key.json not found at:"
  echo "   $KEY_FILE"
  echo ""
  echo "   Steps to obtain it:"
  echo "   1. Go to https://play.google.com/console → Setup → API access"
  echo "   2. Link or create a Google Cloud project"
  echo "   3. Create a service account with 'Release manager' role"
  echo "   4. Download its JSON key"
  echo "   5. Save it as: artifacts/tawbah-mobile/google-play-key.json"
  echo ""
  echo "   Template: artifacts/tawbah-mobile/google-play-key.json.template"
  echo ""
  exit 1
fi

# Validate it is valid JSON with type=service_account
if ! python3 -c "
import json, sys
try:
    data = json.load(open('$KEY_FILE'))
except Exception as e:
    print('Invalid JSON:', e, file=sys.stderr)
    sys.exit(1)
if data.get('type') != 'service_account':
    print('Expected type=service_account, got:', data.get('type'), file=sys.stderr)
    sys.exit(1)
" 2>&1; then
  echo ""
  echo "❌ google-play-key.json is not a valid Google service account key."
  echo ""
  exit 1
fi

echo "✅ google-play-key.json found and valid."

# ── 2. Prepare /tmp build directory ───────────────────────────────────────────

if [ ! -d "$BUILD_DIR/.git" ]; then
  echo "📁 Preparing /tmp build directory..."

  rm -rf "$BUILD_DIR"
  mkdir -p "$BUILD_DIR"
  find "$MOBILE_DIR" -mindepth 1 -maxdepth 1 ! -name 'node_modules' -exec cp -r {} "$BUILD_DIR/" \;
  ln -sf "$MOBILE_DIR/node_modules" "$BUILD_DIR/node_modules"
  cp "$REPO_ROOT/pnpm-lock.yaml" "$BUILD_DIR/pnpm-lock.yaml" 2>/dev/null || true

  # Use isomorphic-git (pure JS) — git binary writes are blocked in Replit sandbox
  node -e "
const git = require('isomorphic-git');
const fs  = require('fs');
const DIR = '/tmp/tawbah-eas-build';
(async () => {
  await git.init({ fs, dir: DIR, defaultBranch: 'main' });
  await git.setConfig({ fs, dir: DIR, path: 'user.name',  value: 'Tawbah Build' });
  await git.setConfig({ fs, dir: DIR, path: 'user.email', value: 'build@tawbah.app' });
  const matrix = await git.statusMatrix({ fs, dir: DIR });
  for (const [filepath,, workdir] of matrix) {
    if (workdir !== 0) {
      await git.add({ fs, dir: DIR, filepath }).catch(() => {});
    }
  }
  await git.commit({
    fs, dir: DIR,
    message: 'eas snapshot',
    author: { name: 'Tawbah Build', email: 'build@tawbah.app' },
  });
  console.log('   /tmp git repo ready.');
})().catch(e => { console.error(e.message); process.exit(1); });
"
fi

# Always copy the latest key into the build dir
cp "$KEY_FILE" "$BUILD_DIR/google-play-key.json"
echo "   google-play-key.json copied into build dir."

# ── 3. Resolve npx eas-cli path ──────────────────────────────────────────────

EAS_BIN="npx eas-cli"
if [ -x "$MOBILE_DIR/node_modules/.bin/eas" ]; then
  EAS_BIN="$MOBILE_DIR/node_modules/.bin/eas"
elif command -v eas > /dev/null 2>&1; then
  EAS_BIN="eas"
fi

# ── 4. Run EAS submit ─────────────────────────────────────────────────────────

echo ""
echo "📤 Submitting to Google Play internal track..."
echo ""

cd "$BUILD_DIR"

# Validate BUILD_ID format if supplied (must match UUID pattern)
BUILD_ID="${1:-}"
if [ -n "$BUILD_ID" ]; then
  if ! echo "$BUILD_ID" | grep -qE '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'; then
    echo "❌ Invalid build ID format: $BUILD_ID"
    echo "   Expected a UUID like: 2f2b0e75-ffc2-459a-b976-02a321fdac9f"
    exit 1
  fi
  EXPO_TOKEN="$EXPO_TOKEN" \
  EAS_SKIP_AUTO_FINGERPRINT=1 \
  $EAS_BIN submit \
    --platform android \
    --profile production \
    --non-interactive \
    --id "$BUILD_ID"
else
  EXPO_TOKEN="$EXPO_TOKEN" \
  EAS_SKIP_AUTO_FINGERPRINT=1 \
  $EAS_BIN submit \
    --platform android \
    --profile production \
    --non-interactive \
    --latest
fi

echo ""
echo "✅ Submitted to Google Play!"
echo ""
echo "   Check submission status at:"
echo "   https://play.google.com/console"
echo ""
echo "   Promote from internal → alpha/beta/production in Play Console when ready."
echo ""
