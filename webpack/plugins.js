const {
  EnvironmentPlugin,
  HotModuleReplacementPlugin,
  NamedModulesPlugin,
} = require('webpack');
const { GenerateSW } = require('workbox-webpack-plugin');
const ExtractCssPlugin = require('mini-css-extract-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const VueClientManifestPlugin = require('vue-server-renderer/client-plugin');
const VueSsrBundlePlugin = require('vue-server-renderer/server-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const {
  resolvePath,
  version,
} = require('./helpers');

module.exports = {
  vueLoaderPlugin: () => new VueLoaderPlugin(),
  vueEnvPlugin: (IS_SSR = false) => new EnvironmentPlugin({
    VUE_ENV: IS_SSR ? 'server' : 'client',
  }),
  vueClientManifestPlugin: () => new VueClientManifestPlugin({
    filename: 'json/clientManifest.json',
  }),
  vueSsrBundlePlugin: () => new VueSsrBundlePlugin({
    filename: 'json/ssrBundle.json',
  }),
  copyPlugin: () => new CopyPlugin([{
    from: resolvePath('src/public'),
    to: resolvePath('dist/public'),
  }]),
  friendlyErrorsPlugin: () => new FriendlyErrorsPlugin(),
  namedModulesPlugin: () => new NamedModulesPlugin(),
  hotModuleReplacementPlugin: () => new HotModuleReplacementPlugin(),
  optimizeCssAssetsPlugin: () => new OptimizeCssAssetsPlugin(),
  minifyPlugin: () => new TerserPlugin({
    parallel: true,
    sourceMap: true,
    extractComments: true,
  }),
  stylelintPlugin: () => new StylelintPlugin({
    files: ['**/*.{vue,html,scss}'],
  }),
  serviceWorkerPlugin: () => new GenerateSW(),
  extractCssPlugin: () => new ExtractCssPlugin({
    filename: `css/[name].css?v=${version}`,
  }),
};
