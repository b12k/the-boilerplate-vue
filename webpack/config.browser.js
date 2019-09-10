const config = require('./config.base');
const {
  resolvePath,
  IS_PROD,
  version,
} = require('./helpers');
const {
  vueLoader,
  styleLoader,
  eslintLoader,
  imageLoader,
} = require('./loaders');
const {
  stylelintPlugin,
  vueClientManifestPlugin,
  optimizeCssAssetsPlugin,
  minifyPlugin,
  friendlyErrorsPlugin,
  hotModuleReplacementPlugin,
  copyPlugin,
  namedModulesPlugin,
  extractCssPlugin,
  serviceWorkerPlugin,
} = require('./plugins');

config.entry = {
  app: resolvePath('src/client/entry.browser'),
};
config.output.filename = `js/[name].js${IS_PROD ? `?v=${version}` : ''}`;
config.output.publicPath = '/public/';
config.module.rules.push(
  vueLoader(),
  styleLoader(),
  imageLoader(),
);
config.plugins.push(
  vueClientManifestPlugin(),
  copyPlugin(),
  serviceWorkerPlugin(),
);
config.devServer = {
  writeToDisk: true,
  publicPath: '/public/',
  contentBase: resolvePath('dist'),
  hot: true,
  inline: true,
  port: 8081,
  historyApiFallback: true,
  noInfo: true,
  overlay: {
    errors: true,
    warnings: false,
  },
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
};

if (IS_PROD) {
  config.optimization = {
    minimizer: [
      optimizeCssAssetsPlugin(),
      minifyPlugin(),
    ],
    namedChunks: true,
    runtimeChunk: {
      name: 'vendor',
    },
    splitChunks: {
      cacheGroups: {
        scripts: {
          test: /node_modules/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  };
  config.plugins.push(extractCssPlugin());
} else {
  config.module.rules.push(eslintLoader());
  config.plugins.push(
    stylelintPlugin(),
    friendlyErrorsPlugin(),
    namedModulesPlugin(),
    hotModuleReplacementPlugin(),
  );
}

module.exports = config;
