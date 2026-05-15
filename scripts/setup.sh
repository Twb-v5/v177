#!/usr/bin/env bash
# =============================================================================
# setup.sh — First-time project setup in a new Replit environment
# =============================================================================
# Run this ONCE after cloning / opening the project in a new account.
# It installs dependencies, builds shared TypeScript libs, pushes the database
# schema, patches expo-router, and installs the Android SDK.
#
# Usage (from repo root):
#   ./scripts/setup.sh
#
# What it does:
#   1. pnpm install             — install all workspace dependencies
#   2. build-libs.sh            — compile .d.ts for shared lib packages
#   3. pnpm db push             — push Drizzle schema to PostgreSQL
#   4. patch-expo-router.js     — fix require.context crash in expo-router
#   5. install Android SDK      — downloads SDK to /tmp/android-sdk if missing
# =============================================================================
set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_HOME="/tmp/android-sdk"

echo "============================================"
echo "  التوبة النصوح — First-time Setup"
echo "============================================"
echo ""

# ── 1. Install dependencies ──────────────────────────────────────────────────
echo "📦  [1/5] Installing all pnpm workspace dependencies..."
cd "$REPO_ROOT"
pnpm install
echo "    ✓ Dependencies installed"
echo ""

# ── 2. Build shared TypeScript lib declarations ──────────────────────────────
echo "🔨  [2/5] Building TypeScript lib declarations..."
bash "$REPO_ROOT/scripts/build-libs.sh"
echo ""

# ── 3. Push database schema ──────────────────────────────────────────────────
echo "🗃️   [3/5] Pushing Drizzle schema to PostgreSQL..."
pnpm --filter @workspace/db run push
echo "    ✓ Database schema up-to-date"
echo ""

# ── 4. Patch expo-router ─────────────────────────────────────────────────────
echo "🔧  [4/5] Patching expo-router (require.context fix)..."
cd "$REPO_ROOT/artifacts/tawbah-mobile"
node scripts/patch-expo-router.js
cd "$REPO_ROOT"
echo "    ✓ expo-router patched"
echo ""

# ── 5. Android SDK ───────────────────────────────────────────────────────────
echo "🤖  [5/5] Android SDK setup..."

if [ -d "$ANDROID_HOME/platform-tools" ] && \
   [ -d "$ANDROID_HOME/build-tools" ] && \
   [ -d "$ANDROID_HOME/platforms" ]; then
  echo "    ✓ Android SDK already installed at $ANDROID_HOME"
else
  echo "    Installing Android SDK at $ANDROID_HOME ..."
  echo "    (This downloads ~300 MB — takes a few minutes on first run)"

  CMDLINE_TOOLS_ZIP="/tmp/cmdline-tools.zip"
  CMDLINE_TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"

  # Download command-line tools
  echo "    Downloading command-line tools..."
  curl -fsSL "$CMDLINE_TOOLS_URL" -o "$CMDLINE_TOOLS_ZIP"

  # Extract into the expected directory layout
  mkdir -p "$ANDROID_HOME/cmdline-tools"
  unzip -q "$CMDLINE_TOOLS_ZIP" -d "$ANDROID_HOME/cmdline-tools"
  # Google's zip extracts as "cmdline-tools/" — rename to "latest"
  if [ -d "$ANDROID_HOME/cmdline-tools/cmdline-tools" ]; then
    mv "$ANDROID_HOME/cmdline-tools/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"
  fi
  rm -f "$CMDLINE_TOOLS_ZIP"

  # Fix permissions
  chmod +x "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" 2>/dev/null || true

  export ANDROID_HOME
  export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

  # Accept licenses non-interactively
  yes | sdkmanager --licenses > /dev/null 2>&1 || true

  # Install required SDK components
  echo "    Installing platform-tools, build-tools, platform-35..."
  sdkmanager \
    "platform-tools" \
    "build-tools;35.0.0" \
    "platforms;android-35" \
    --sdk_root="$ANDROID_HOME"

  echo "    ✓ Android SDK installed at $ANDROID_HOME"
fi

# Write local.properties for the web Capacitor project
LOCAL_PROPS="$REPO_ROOT/artifacts/tawbah-web/android/local.properties"
if [ -f "$LOCAL_PROPS" ]; then
  echo "    ✓ local.properties already present"
else
  if [ -d "$REPO_ROOT/artifacts/tawbah-web/android" ]; then
    echo "sdk.dir=$ANDROID_HOME" > "$LOCAL_PROPS"
    echo "    ✓ local.properties written"
  fi
fi
echo ""

echo "============================================"
echo "  ✅  Setup complete!"
echo ""
echo "  Next steps:"
echo "  1. Add EXPO_TOKEN to Replit Secrets (for mobile APK builds)"
echo "  2. Configure OpenAI via code_execution sandbox (see replit.md)"
echo "  3. Start workflows: 'Start application' and 'Start backend'"
echo ""
echo "  Build commands:"
echo "    Web APK  → ./scripts/build-web-apk.sh"
echo "    Mobile   → ./scripts/build-apk.sh"
echo "    All      → ./scripts/build-all.sh"
echo "============================================"
