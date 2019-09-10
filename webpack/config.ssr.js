const nodeExternals = require('webpack-node-externals');

const config = require('./config.base');
const { resolvePath } = require('./helpers');
const {
  vueLoader,
  imageLoader,
  ignoreLoader,
} = require('./loaders');
const {
  vueSsrBundlePlugin,
  vueEnvPlugin,
} = require('./plugins');

config.target = 'node';
config.entry = resolvePath('src/client/entry.ssr');

config.output.libraryTarget = 'commonjs2';

config.externals = nodeExternals();
config.module.rules.push(
  vueLoader(true),
  imageLoader(true),
  ignoreLoader(),
);
config.plugins.push(
  vueSsrBundlePlugin(),
  vueEnvPlugin(true),
);

module.exports = config;
