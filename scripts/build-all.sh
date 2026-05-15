#!/usr/bin/env bash
# =============================================================================
# build-all.sh — One-command build: typecheck + web bundle + web APK + mobile APK
# =============================================================================
# Builds EVERYTHING in the correct order:
#   1. TypeScript lib declarations (required for typecheck)
#   2. Typecheck all packages
#   3. Web app APK (Capacitor + local Gradle) → outputs debug APK locally
#   4. Mobile app APK (EAS Cloud) → submitted to cloud, download when done
#
# Usage (from repo root):
#   ./scripts/build-all.sh               # typecheck + both APKs
#   ./scripts/build-all.sh --skip-check  # skip typecheck, just build APKs
#   ./scripts/build-all.sh --web-only    # only web APK
#   ./scripts/build-all.sh --mobile-only # only mobile APK (EAS)
#
# Requirements:
#   - Run inside Replit (Android SDK at /tmp/android-sdk)
#   - EXPO_TOKEN set in Replit Secrets (for mobile build)
# =============================================================================
set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKIP_CHECK=false
WEB_ONLY=false
MOBILE_ONLY=false

for arg in "$@"; do
  case "$arg" in
    --skip-check)  SKIP_CHECK=true ;;
    --web-only)    WEB_ONLY=true ;;
    --mobile-only) MOBILE_ONLY=true ;;
  esac
done

echo "============================================"
echo "  التوبة النصوح — Full Build"
echo "============================================"
echo ""

# ── Step 1: Build TypeScript lib declarations ─────────────────────────────────
if [ "$SKIP_CHECK" = false ]; then
  echo "🔨  [1/4] Building TypeScript lib declarations..."
  bash "$REPO_ROOT/scripts/build-libs.sh"
  echo ""

  # ── Step 2: Typecheck ─────────────────────────────────────────────────────
  echo "🔍  [2/4] Typechecking all packages..."
  cd "$REPO_ROOT"
  pnpm run typecheck
  echo "    ✓ No TypeScript errors"
  echo ""
else
  echo "⏭️   Skipping typecheck (--skip-check)"
  echo ""
fi

# ── Step 3: Web APK ──────────────────────────────────────────────────────────
if [ "$MOBILE_ONLY" = false ]; then
  echo "🌐  [3/4] Building Web APK (Capacitor + Gradle)..."
  bash "$REPO_ROOT/scripts/build-web-apk.sh"
  echo ""
else
  echo "⏭️   Skipping web APK (--mobile-only)"
  echo ""
fi

# ── Step 4: Mobile APK ───────────────────────────────────────────────────────
if [ "$WEB_ONLY" = false ]; then
  echo "📱  [4/4] Submitting Mobile APK (EAS Cloud)..."
  bash "$REPO_ROOT/scripts/build-apk.sh"
  echo ""
else
  echo "⏭️   Skipping mobile APK (--web-only)"
  echo ""
fi

echo "============================================"
echo "  ✅  Build complete!"
echo ""
if [ "$MOBILE_ONLY" = false ]; then
  APK_PATH="$REPO_ROOT/artifacts/tawbah-web/android/app/build/outputs/apk/debug/app-debug.apk"
  if [ -f "$APK_PATH" ]; then
    SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "  Web APK   → $APK_PATH ($SIZE)"
  fi
fi
if [ "$WEB_ONLY" = false ]; then
  echo "  Mobile APK → https://expo.dev/accounts/omarkaremksa/projects/o/builds"
  echo "               (ready in ~10-20 min)"
fi
echo "============================================"
