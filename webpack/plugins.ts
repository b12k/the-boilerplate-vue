import { VueLoaderPlugin } from 'vue-loader';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import { DefinePlugin, ProgressPlugin } from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { BundleStatsWebpackPlugin } from 'bundle-stats-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

import { generateManifest } from './utils';

export const bundleStatsWebpackPlugin = new BundleStatsWebpackPlugin();
export const miniCssExtractPlugin = new MiniCssExtractPlugin({
  filename: 'public/css/[name].[contenthash:8].css',
  chunkFilename: 'public/css/chunk.[contenthash:8].css',
});
export const terserPlugin = new TerserPlugin({
  extractComments: false,
});
export const vueLoaderPlugin = new VueLoaderPlugin();

export const webpackClientManifestPlugin = new WebpackManifestPlugin({
  fileName: 'public/manifest.json',
  generate: generateManifest,
});
export const webpackSsrManifestPlugin = new WebpackManifestPlugin({
  fileName: 'ssr/manifest.json',
  useEntryKeys: true,
});
export const webpackProgressPlugin = new ProgressPlugin();
export const webpackDefinePlugin = new DefinePlugin({
  __VUE_OPTIONS_API__: true,
  __VUE_PROD_DEVTOOLS__: true,
});
export const tsConfigPathsPlugin = new TsconfigPathsPlugin();
