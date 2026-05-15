#!/usr/bin/env bash
# =============================================================================
# typecheck.sh — Build lib declarations then typecheck all packages
# =============================================================================
# The TypeScript project-reference libs (db, api-zod, integrations-openai,
# api-client-react) must be compiled to .d.ts before tsc can resolve them.
# This script does both steps in the right order.
#
# Usage (from repo root):
#   ./scripts/typecheck.sh
# =============================================================================
set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "🔨 Building TypeScript lib declarations..."
bash "$REPO_ROOT/scripts/build-libs.sh"

echo ""
echo "🔍 Typechecking all packages..."
cd "$REPO_ROOT"
pnpm run typecheck

echo ""
echo "✅ All packages typecheck clean."
