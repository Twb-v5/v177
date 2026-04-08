const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const appRoot = path.join(projectRoot, 'app');

process.env.EXPO_ROUTER_APP_ROOT = appRoot;

const config = getDefaultConfig(projectRoot);

config.resolver.unstable_enablePackageExports = true;

const originalTransformerPath = config.transformer?.babelTransformerPath;

config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

const origCustomTransformOptions = config.transformer.customTransformOptions || {};
config.transformer.customTransformOptions = {
  ...origCustomTransformOptions,
  routerRoot: appRoot,
};

module.exports = config;
