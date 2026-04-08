const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Inject EXPO_ROUTER_APP_ROOT for expo-router - must be set globally for Metro workers
global.__EXPO_ROUTER_APP_ROOT__ = 'app';

// Allow Expo to resolve packages naturally without strict isolation
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
