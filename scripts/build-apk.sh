#!/usr/bin/env bash
# =============================================================================
# build-apk.sh — Build Android APK via EAS Cloud
# =============================================================================
# Usage (run from repo root):
#   ./scripts/build-apk.sh              # preview APK (distributable .apk)
#   ./scripts/build-apk.sh production   # production AAB (Play Store)
#
# Requirements:
#   - EXPO_TOKEN secret must be set in Replit Secrets (lock icon in sidebar)
#   - Run from the repo root: /home/runner/workspace
#
# Where to download the APK after the build:
#   https://expo.dev/accounts/hadysbadys/projects/tawbah-mobile/builds
# =============================================================================
set -e

PROFILE="${1:-preview}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MOBILE_DIR="$REPO_ROOT/artifacts/tawbah-mobile"
BUILD_DIR="/tmp/tawbah-eas-build"

if [ -z "$EXPO_TOKEN" ]; then
  echo ""
  echo "❌ EXPO_TOKEN is not set."
  echo "   Add it in Replit Secrets (lock icon in sidebar)."
  echo "   Get your token from: https://expo.dev/accounts/hadysbadys/settings/access-tokens"
  echo ""
  exit 1
fi

echo "🔧 Patching expo-router files..."
cd "$MOBILE_DIR"
node scripts/patch-expo-router.js

echo "📁 Copying project to /tmp (outside git repo for EAS compatibility)..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
find "$MOBILE_DIR" -mindepth 1 -maxdepth 1 ! -name 'node_modules' -exec cp -r {} "$BUILD_DIR/" \;

echo "🔗 Linking node_modules and lockfile for EAS config resolution..."
ln -sf "$MOBILE_DIR/node_modules" "$BUILD_DIR/node_modules"
# EAS requires a lockfile for deterministic installs on the cloud server
cp "$REPO_ROOT/pnpm-lock.yaml" "$BUILD_DIR/pnpm-lock.yaml" 2>/dev/null || true

echo "🔧 Initialising temporary git repo for EAS archiving..."
# EAS requires a git repo to create the project archive.
# We init one in /tmp so it is completely outside the workspace.
cd "$BUILD_DIR"
git -c init.defaultBranch=main init
git config user.email "build@tawbah.app"
git config user.name "Tawbah Build"
git add -A
git commit --quiet -m "eas build snapshot"

echo ""
echo "📦 Starting EAS build (profile: $PROFILE, platform: android)..."
echo "   EAS runs on cloud servers — you can close this terminal safely."
echo ""

EXPO_TOKEN="$EXPO_TOKEN" \
EAS_SKIP_AUTO_FINGERPRINT=1 \
npx eas-cli build \
  --platform android \
  --profile "$PROFILE" \
  --non-interactive \
  --no-wait

echo ""
echo "✅ Build submitted to EAS Cloud!"
echo ""
echo "   Track it at:"
echo "   https://expo.dev/accounts/hadysbadys/projects/tawbah-mobile/builds"
echo ""
echo "   Once done (~10-20 min), an APK download link appears on that page."
