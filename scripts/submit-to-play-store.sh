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
#      (copy the template and fill in your service account credentials)
#
# How to get google-play-key.json:
#   1. Open https://play.google.com/console → Setup → API access
#   2. Link to a Google Cloud project (or create one)
#   3. Create a service account with "Release manager" role
#   4. Download the JSON key for that service account
#   5. Place the downloaded file at: artifacts/tawbah-mobile/google-play-key.json
#
# EAS account: aiservx1
# Play Store track: internal (change "track" in eas.json to promote to alpha/beta/production)
# =============================================================================
set -e

BUILD_ID="${1:-}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MOBILE_DIR="$REPO_ROOT/artifacts/tawbah-mobile"
BUILD_DIR="/tmp/tawbah-eas-build"
KEY_FILE="$MOBILE_DIR/google-play-key.json"

# ── 1. Validate prerequisites ─────────────────────────────────────────────────

if [ -z "$EXPO_TOKEN" ]; then
  echo ""
  echo "❌ EXPO_TOKEN is not set."
  echo "   Add it in Replit Secrets (lock icon in sidebar)."
  echo "   Get your token from: https://expo.dev/accounts/aiservx1/settings/access-tokens"
  echo ""
  exit 1
fi

if [ ! -f "$KEY_FILE" ]; then
  echo ""
  echo "❌ google-play-key.json not found at: $KEY_FILE"
  echo ""
  echo "   To obtain this file:"
  echo "   1. Go to https://play.google.com/console → Setup → API access"
  echo "   2. Link to a Google Cloud project (or create one)"
  echo "   3. Create a service account with 'Release manager' role"
  echo "   4. Download the JSON key for that service account"
  echo "   5. Place it at: artifacts/tawbah-mobile/google-play-key.json"
  echo ""
  echo "   A template showing the expected structure is at:"
  echo "   artifacts/tawbah-mobile/google-play-key.json.template"
  echo ""
  exit 1
fi

# Validate JSON is valid
if ! python3 -c "import json,sys; json.load(open('$KEY_FILE'))" 2>/dev/null; then
  echo ""
  echo "❌ google-play-key.json is not valid JSON. Please check the file."
  echo ""
  exit 1
fi

# Check it has the expected service_account type
KEY_TYPE=$(python3 -c "import json; print(json.load(open('$KEY_FILE')).get('type',''))" 2>/dev/null || echo "")
if [ "$KEY_TYPE" != "service_account" ]; then
  echo ""
  echo "❌ google-play-key.json does not look like a Google service account key."
  echo "   Expected 'type': 'service_account' but got: '$KEY_TYPE'"
  echo ""
  exit 1
fi

echo "✅ google-play-key.json found and valid."

# ── 2. Prepare build directory ────────────────────────────────────────────────

echo "📁 Preparing /tmp build directory for EAS submit..."

if [ ! -d "$BUILD_DIR/.git" ]; then
  echo "   /tmp build dir not found — creating it now..."

  rm -rf "$BUILD_DIR"
  mkdir -p "$BUILD_DIR"
  find "$MOBILE_DIR" -mindepth 1 -maxdepth 1 ! -name 'node_modules' -exec cp -r {} "$BUILD_DIR/" \;
  ln -sf "$MOBILE_DIR/node_modules" "$BUILD_DIR/node_modules"
  cp "$REPO_ROOT/pnpm-lock.yaml" "$BUILD_DIR/pnpm-lock.yaml" 2>/dev/null || true

  # Create git repo using isomorphic-git (git binary writes are restricted in Replit)
  node -e "
const git = require('isomorphic-git');
const fs = require('fs');
const path = require('path');
const BUILD_DIR = '/tmp/tawbah-eas-build';
async function run() {
  await git.init({ fs, dir: BUILD_DIR, defaultBranch: 'main' });
  await git.setConfig({ fs, dir: BUILD_DIR, path: 'user.name', value: 'Tawbah Build' });
  await git.setConfig({ fs, dir: BUILD_DIR, path: 'user.email', value: 'build@tawbah.app' });
  const status = await git.statusMatrix({ fs, dir: BUILD_DIR });
  for (const [name] of status.filter(([,, w]) => w !== 0)) {
    try { await git.add({ fs, dir: BUILD_DIR, filepath: name }); } catch {}
  }
  await git.commit({ fs, dir: BUILD_DIR, message: 'eas snapshot',
    author: { name: 'Tawbah Build', email: 'build@tawbah.app' } });
  console.log('   Git repo ready.');
}
run().catch(e => { console.error(e.message); process.exit(1); });
" 2>&1
fi

# Always copy the latest key into the build dir
echo "   Copying google-play-key.json into build dir..."
cp "$KEY_FILE" "$BUILD_DIR/google-play-key.json"

# ── 3. Run EAS submit ─────────────────────────────────────────────────────────

echo ""
echo "📤 Submitting to Google Play (internal track)..."
echo ""

cd "$BUILD_DIR"

SUBMIT_CMD="EXPO_TOKEN=\"$EXPO_TOKEN\" EAS_SKIP_AUTO_FINGERPRINT=1 eas submit --platform android --profile production --non-interactive"

if [ -n "$BUILD_ID" ]; then
  SUBMIT_CMD="$SUBMIT_CMD --id $BUILD_ID"
  echo "   Using build ID: $BUILD_ID"
else
  echo "   Using latest production build from EAS."
fi

eval "$SUBMIT_CMD" 2>&1

echo ""
echo "✅ Submitted to Google Play!"
echo ""
echo "   Check submission status at:"
echo "   https://play.google.com/console"
echo ""
echo "   After review, promote from internal → alpha/beta/production in Play Console."
echo ""
