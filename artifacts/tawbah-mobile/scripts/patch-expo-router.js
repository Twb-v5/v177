#!/usr/bin/env node
/**
 * Patches expo-router _ctx.js and _ctx.web.js to use a static relative path
 * instead of process.env.EXPO_ROUTER_APP_ROOT.
 *
 * Metro's require.context() requires a STRING LITERAL as the first argument —
 * it cannot accept a runtime variable. Using "../../app" (relative to the
 * _ctx file inside node_modules/expo-router/) resolves correctly to the
 * project's app/ directory on ANY machine: local, EAS build servers, CI, etc.
 */
const fs = require("fs");
const path = require("path");

const dir = path.resolve(__dirname, "../node_modules/expo-router");

const patches = [
  {
    file: path.join(dir, "_ctx.js"),
    // Native: 3-arg require.context, no import mode arg
    replacements: [
      ["process.env.EXPO_ROUTER_APP_ROOT", '"../../app"'],
    ],
  },
  {
    file: path.join(dir, "_ctx.web.js"),
    // Web: 4-arg require.context, includes EXPO_ROUTER_IMPORT_MODE
    replacements: [
      ["process.env.EXPO_ROUTER_APP_ROOT", '"../../app"'],
      ["process.env.EXPO_ROUTER_IMPORT_MODE", '"lazy"'],
    ],
  },
];

let allOk = true;
for (const { file, replacements } of patches) {
  if (!fs.existsSync(file)) {
    console.log(`[patch-expo-router] SKIP — not found: ${path.basename(file)}`);
    continue;
  }
  let content = fs.readFileSync(file, "utf8");
  let changed = false;
  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.replace(from, to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, content, "utf8");
    console.log(`[patch-expo-router] ✓ Patched ${path.basename(file)}`);
  } else {
    console.log(`[patch-expo-router] Already patched: ${path.basename(file)}`);
  }
}

if (allOk) console.log("[patch-expo-router] Done.");
