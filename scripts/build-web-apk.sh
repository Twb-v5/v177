#!/usr/bin/env bash
# =============================================================================
# build-web-apk.sh — Build Android APK for tawbah-web (Capacitor + Gradle)
# =============================================================================
# Builds the web app into a native Android APK using the Android SDK that
# Replit auto-provisions at /tmp/android-sdk.
#
# Usage (from repo root):
#   ./scripts/build-web-apk.sh
#
# Output:
#   artifacts/tawbah-web/android/app/build/outputs/apk/debug/app-debug.apk
#
# Requirements:
#   - Must run INSIDE Replit (Android SDK lives at /tmp/android-sdk)
#   - Java 21 available via Nix — checked automatically below
# =============================================================================
set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB_DIR="$REPO_ROOT/artifacts/tawbah-web"
ANDROID_DIR="$WEB_DIR/android"
APK_OUT="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"

ANDROID_HOME="/tmp/android-sdk"
JAVA_HOME="$(dirname "$(dirname "$(readlink -f "$(which java)")")")"
export ANDROID_HOME JAVA_HOME

echo "============================================"
echo "  التوبة النصوح — Web APK Build (Capacitor)"
echo "============================================"
echo ""

# ── 1. Verify Android SDK ────────────────────────────────────────────────────
if [ ! -d "$ANDROID_HOME/platform-tools" ]; then
  echo "❌  Android SDK not found at $ANDROID_HOME"
  echo "    This script is designed to run inside Replit."
  exit 1
fi
echo "✔  Java:         $(java -version 2>&1 | head -1)"
echo "✔  ANDROID_HOME: $ANDROID_HOME"
echo ""

# ── 2. Build Vite web bundle ─────────────────────────────────────────────────
# Bake the server URL into the APK at build time so Capacitor's WebView knows
# where to send API requests (window.location.origin = "https://localhost" in
# native context — not useful as an API base).
#
# Override with:  SERVER_URL=https://your-domain.app ./scripts/build-web-apk.sh
if [ -z "$VITE_API_BASE_URL" ]; then
  if [ -n "$SERVER_URL" ]; then
    export VITE_API_BASE_URL="$SERVER_URL"
  elif [ -n "$REPLIT_DOMAINS" ]; then
    # Use the first Replit domain (dev or prod)
    FIRST_DOMAIN="${REPLIT_DOMAINS%%,*}"
    export VITE_API_BASE_URL="https://$FIRST_DOMAIN"
  fi
fi

echo "📦  [1/3] Building Vite web bundle..."
if [ -n "$VITE_API_BASE_URL" ]; then
  echo "    API base baked into APK: $VITE_API_BASE_URL"
fi
cd "$WEB_DIR"
pnpm run build
echo "    ✓ Bundle ready → dist/public/"
echo ""

# ── 3. Sync Capacitor ────────────────────────────────────────────────────────
echo "🔄  [2/3] Capacitor sync → Android..."
npx cap sync android
echo "    ✓ Sync complete"
echo ""

# ── 4. Gradle build ──────────────────────────────────────────────────────────
echo "🏗️   [3/3] Gradle assembleDebug..."
echo "sdk.dir=$ANDROID_HOME" > "$ANDROID_DIR/local.properties"
cd "$ANDROID_DIR"
./gradlew assembleDebug --no-daemon -x test
echo ""

# ── 5. Result ────────────────────────────────────────────────────────────────
if [ -f "$APK_OUT" ]; then
  SIZE=$(du -h "$APK_OUT" | cut -f1)
  echo "============================================"
  echo "  ✅  APK built successfully!"
  echo "      Size : $SIZE"
  echo "      Path : $APK_OUT"
  echo "============================================"
else
  echo "❌  APK not found. Check Gradle output above."
  exit 1
fi
