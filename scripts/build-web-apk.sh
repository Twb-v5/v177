#!/usr/bin/env bash
# =============================================================================
# build-web-apk.sh — Build Android APK for the WEB app (Capacitor)
# =============================================================================
# Usage (run from repo root):
#   ./scripts/build-web-apk.sh
#
# Requirements:
#   - EXPO_TOKEN secret must be set in Replit Secrets
#
# How it works:
#   1. Copies only the web-relevant parts of the monorepo to /tmp
#   2. Initialises a fresh git repo in /tmp (avoids workspace git locks)
#   3. Submits an EAS custom build that runs:
#      Vite build → cap sync → Gradle assembleDebug → APK
#
# Track the build at:
#   https://expo.dev/accounts/hadysbadys/projects/workspace/builds
# =============================================================================
set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="/tmp/tawbah-web-eas-build"

if [ -z "$EXPO_TOKEN" ]; then
  echo "EXPO_TOKEN is not set. Add it in Replit Secrets (lock icon in sidebar)."
  exit 1
fi

echo "Preparing slim build directory (web-only files)..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Copy root-level config files individually (fast, no heavy dirs)
for f in package.json pnpm-workspace.yaml pnpm-lock.yaml \
          tsconfig.json tsconfig.base.json \
          eas.json app.json .easignore .eas; do
  [ -e "$REPO_ROOT/$f" ] && cp -r "$REPO_ROOT/$f" "$BUILD_DIR/$f"
done

# Copy only the packages needed for the web APK build
mkdir -p "$BUILD_DIR/artifacts" "$BUILD_DIR/lib"
cp -r "$REPO_ROOT/artifacts/tawbah-web"  "$BUILD_DIR/artifacts/tawbah-web"
cp -r "$REPO_ROOT/lib"                   "$BUILD_DIR/lib"
[ -d "$REPO_ROOT/scripts" ] && cp -r "$REPO_ROOT/scripts" "$BUILD_DIR/scripts"

echo "Linking root node_modules (for EAS local config resolution)..."
ln -sf "$REPO_ROOT/node_modules" "$BUILD_DIR/node_modules"

echo "Build directory size:"
du -sh "$BUILD_DIR" 2>/dev/null

echo "Initialising temporary git repo for EAS archiving..."
cd "$BUILD_DIR"
git -c init.defaultBranch=main init
git config user.email "build@tawbah.app"
git config user.name "Tawbah Build"
git add -A
git commit --quiet -m "web apk build snapshot"

echo ""
echo "Submitting EAS custom build (web APK via Capacitor)..."
echo "EAS servers have Android SDK — Gradle will build the APK there."
echo ""

EXPO_TOKEN="$EXPO_TOKEN" \
EAS_SKIP_AUTO_FINGERPRINT=1 \
npx eas-cli build \
  --platform android \
  --profile web-apk \
  --non-interactive \
  --no-wait

echo ""
echo "Build submitted!"
echo "Track it at: https://expo.dev/accounts/hadysbadys/projects/workspace/builds"
echo "APK download link appears there when done (~10-20 min)."
