const config = require('./config.base');
const {
  resolvePath,
  IS_PROD_MODE,
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
  vueEnvPlugin,
} = require('./plugins');

config.entry = resolvePath('src/client/entry.browser');

config.output.filename = `js/[name]${IS_PROD_MODE ? '.[chunkhash:8]' : ''}.js`;
config.output.publicPath = IS_PROD_MODE ? '/public/' : 'http://localhost:8081/public/';

config.module.rules.push(
  vueLoader(),
  styleLoader(),
  imageLoader(),
);
config.plugins.push(
  vueEnvPlugin(),
  vueClientManifestPlugin(),
  copyPlugin(),
  serviceWorkerPlugin(),
);

if (IS_PROD_MODE) {
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
  config.devServer = {
    writeToDisk: true,
    publicPath: config.output.publicPath,
    contentBase: resolvePath('dist'),
    hot: true,
    inline: true,
    port: 8081,
    historyApiFallback: true,
    overlay: {
      errors: true,
      warnings: false,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  };
}

module.exports = config;
