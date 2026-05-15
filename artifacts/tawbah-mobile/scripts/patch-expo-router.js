#!/usr/bin/env node
/**
 * Patches expo-router _ctx.js, _ctx.android.js, _ctx.ios.js and _ctx.web.js
 * to use a static relative path instead of process.env.EXPO_ROUTER_APP_ROOT.
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
    replacements: [
      ["process.env.EXPO_ROUTER_APP_ROOT", '"../../app"'],
      ["process.env.EXPO_ROUTER_IMPORT_MODE", '"lazy"'],
    ],
  },
  {
    file: path.join(dir, "_ctx.android.js"),
    replacements: [
      ["process.env.EXPO_ROUTER_APP_ROOT", '"../../app"'],
      ["process.env.EXPO_ROUTER_IMPORT_MODE", '"lazy"'],
    ],
  },
  {
    file: path.join(dir, "_ctx.ios.js"),
    replacements: [
      ["process.env.EXPO_ROUTER_APP_ROOT", '"../../app"'],
      ["process.env.EXPO_ROUTER_IMPORT_MODE", '"lazy"'],
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
  {
    file: path.join(dir, "build/import-mode/index.js"),
    // Hardcode 'lazy' so screens load via React.lazy instead of sync require.
    // Without this, loadRoute() returns a Promise but fromImport() treats it
    // as a module object — resulting in component.default === undefined.
    replacements: [
      [
        "exports.default = process.env.EXPO_ROUTER_IMPORT_MODE || 'sync';",
        "exports.default = 'lazy';",
      ],
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
