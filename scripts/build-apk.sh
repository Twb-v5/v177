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
# EAS account: omarkaremksa
# Where to download the build after it finishes:
#   https://expo.dev/accounts/omarkaremksa/projects/o/builds
#
# Note: The EAS free plan allows 1 Android build per month.
#       If the quota is exhausted, the build will be rejected by EAS.
#       Upgrade at: https://expo.dev/accounts/omarkaremksa/settings/billing
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
  echo "   Get your token from: https://expo.dev/accounts/omarkaremksa/settings/access-tokens"
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

# EAS requires a lockfile for deterministic installs on the cloud server.
# We also copy pnpm-workspace.yaml so that the overrides defined there match
# the overrides recorded in the lockfile — without it pnpm raises
# ERR_PNPM_LOCKFILE_CONFIG_MISMATCH and the EAS build fails.
cp "$REPO_ROOT/pnpm-lock.yaml"      "$BUILD_DIR/pnpm-lock.yaml"      2>/dev/null || true
cp "$REPO_ROOT/pnpm-workspace.yaml" "$BUILD_DIR/pnpm-workspace.yaml" 2>/dev/null || true
# pnpm-workspace.yaml references patch files — copy the patches dir too
if [ -d "$REPO_ROOT/patches" ]; then
  cp -r "$REPO_ROOT/patches" "$BUILD_DIR/patches"
fi

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
EAS_BUILD_NO_EXPO_GO_WARNING=true \
npx eas-cli build \
  --platform android \
  --profile "$PROFILE" \
  --non-interactive \
  --no-wait

echo ""
echo "✅ Build submitted to EAS Cloud!"
echo ""
echo "   Track it at:"
echo "   https://expo.dev/accounts/omarkaremksa/projects/o/builds"
echo ""
if [ "$PROFILE" = "production" ]; then
  echo "   Profile: production (AAB — Play Store ready)"
  echo "   Once done (~10-20 min), the .aab file appears on that page."
  echo ""
  echo "   To submit to the Play Store (requires google-play-key.json):"
  echo "   Copy google-play-key.json.template → google-play-key.json, fill in your"
  echo "   Google Play service account credentials, then run:"
  echo "   eas submit --platform android --profile production"
else
  echo "   Profile: preview (APK — sideloadable)"
  echo "   Once done (~10-20 min), an APK download link appears on that page."
fi
echo ""
