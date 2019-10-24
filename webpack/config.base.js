const {
  IS_PROD_MODE,
  IS_PROD_SERVER,
  resolvePath,
} = require('./helpers');

const {
  jsLoader,
  iconLoader,
} = require('./loaders');

const alias = require('./aliases');

const { vueLoaderPlugin } = require('./plugins');

const config = {
  mode: IS_PROD_MODE ? 'production' : 'development',
  resolve: {
    alias,
    extensions: ['.js', '.vue'],
  },
  output: {
    path: resolvePath('dist/public'),
  },
  module: {
    rules: [
      jsLoader(),
      iconLoader(),
    ],
  },
  plugins: [vueLoaderPlugin()],
};

if (!IS_PROD_SERVER) {
  config.devtool = 'source-map';
}

module.exports = config;
