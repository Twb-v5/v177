#!/usr/bin/env bash
# =============================================================================
# setup.sh — First-time project setup in a new Replit environment
# =============================================================================
# Run this ONCE after cloning / opening the project in a new account.
# It installs dependencies, builds shared TypeScript libs, pushes the database
# schema, and patches expo-router.
#
# Usage (from repo root):
#   ./scripts/setup.sh
#
# What it does:
#   1. pnpm install             — install all workspace dependencies
#   2. build-libs.sh            — compile .d.ts for shared lib packages
#   3. pnpm db push             — push Drizzle schema to PostgreSQL
#   4. patch-expo-router.js     — fix require.context crash in expo-router
# =============================================================================
set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "============================================"
echo "  التوبة النصوح — First-time Setup"
echo "============================================"
echo ""

# ── 1. Install dependencies ──────────────────────────────────────────────────
echo "📦  [1/4] Installing all pnpm workspace dependencies..."
cd "$REPO_ROOT"
pnpm install
echo "    ✓ Dependencies installed"
echo ""

# ── 2. Build shared TypeScript lib declarations ──────────────────────────────
echo "🔨  [2/4] Building TypeScript lib declarations..."
bash "$REPO_ROOT/scripts/build-libs.sh"
echo ""

# ── 3. Push database schema ──────────────────────────────────────────────────
echo "🗃️   [3/4] Pushing Drizzle schema to PostgreSQL..."
pnpm --filter @workspace/db run push
echo "    ✓ Database schema up-to-date"
echo ""

# ── 4. Patch expo-router ─────────────────────────────────────────────────────
echo "🔧  [4/4] Patching expo-router (require.context fix)..."
cd "$REPO_ROOT/artifacts/tawbah-mobile"
node scripts/patch-expo-router.js
cd "$REPO_ROOT"
echo "    ✓ expo-router patched"
echo ""

echo "============================================"
echo "  ✅  Setup complete!"
echo ""
echo "  Next steps:"
echo "  1. Add EXPO_TOKEN to Replit Secrets (for mobile APK builds)"
echo "  2. Configure OpenAI via code_execution sandbox (see replit.md)"
echo "  3. Start workflows: 'Start application' and 'Start backend'"
echo "============================================"
