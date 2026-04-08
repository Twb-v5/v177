const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;

process.env.EXPO_ROUTER_APP_ROOT = path.join(projectRoot, 'app');

const config = getDefaultConfig(projectRoot);

config.resolver.unstable_enablePackageExports = true;

module.exports = config;
