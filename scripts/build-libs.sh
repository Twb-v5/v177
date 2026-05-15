#!/usr/bin/env bash
# =============================================================================
# build-libs.sh — Build TypeScript declaration files for all shared lib packages
# =============================================================================
# Run this whenever you want typecheck to pass cleanly across all packages.
# These libs use `composite: true` + `emitDeclarationOnly` — they only emit
# .d.ts files (no JS). The Vite dev server and tsx runtime don't need them,
# but tsc --noEmit does when resolving project references.
#
# Usage (from repo root):
#   ./scripts/build-libs.sh
# =============================================================================
set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "🔨 Building lib/db ..."
npx tsc -p "$REPO_ROOT/lib/db/tsconfig.json"

echo "🔨 Building lib/api-zod ..."
npx tsc -p "$REPO_ROOT/lib/api-zod/tsconfig.json"

echo "🔨 Building lib/integrations-openai-ai-server ..."
npx tsc -p "$REPO_ROOT/lib/integrations-openai-ai-server/tsconfig.json"

echo "🔨 Building lib/api-client-react ..."
npx tsc -p "$REPO_ROOT/lib/api-client-react/tsconfig.json"

echo ""
echo "✅ All lib declaration files built successfully."
echo "   You can now run: pnpm run typecheck"
