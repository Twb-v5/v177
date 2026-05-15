#!/usr/bin/env node
// Patches expo-router/_ctx.web.js to use literal string paths for Metro web bundling.
// Metro requires require.context() first arg to be a string literal, not process.env.X
const fs = require('fs');
const path = require('path');

const appRoot = path.resolve(__dirname, '../app');
const ctxFile = path.resolve(__dirname, '../node_modules/expo-router/_ctx.web.js');

if (!fs.existsSync(ctxFile)) { console.log('_ctx.web.js not found, skipping patch'); process.exit(0); }

let content = fs.readFileSync(ctxFile, 'utf8');
if (content.includes('process.env.EXPO_ROUTER_APP_ROOT')) {
  content = content
    .replace('process.env.EXPO_ROUTER_APP_ROOT', JSON.stringify(appRoot))
    .replace('process.env.EXPO_ROUTER_IMPORT_MODE', JSON.stringify('lazy'));
  fs.writeFileSync(ctxFile, content);
  console.log('[patch-web] Patched _ctx.web.js with literal path:', appRoot);
} else {
  console.log('[patch-web] Already patched or no env var found, skipping');
}
