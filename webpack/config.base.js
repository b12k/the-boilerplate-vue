const {
  IS_PROD,
  resolvePath,
} = require('./helpers');

const {
  jsLoader,
  iconLoader,
} = require('./loaders');

const { vueLoaderPlugin } = require('./plugins');

const config = {
  mode: IS_PROD ? 'production' : 'development',
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      '@assets': resolvePath('src/client/assets'),
      '@components': resolvePath('src/client/components'),
      '@helpers': resolvePath('src/client/helpers'),
      '@pages': resolvePath('src/client/pages'),
      '@services': resolvePath('src/client/services'),
      '@store': resolvePath('src/client/store'),
      '@styles': resolvePath('src/client/styles'),
    },
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

if (!IS_PROD) {
  config.devtool = 'source-map';
}

module.exports = config;
