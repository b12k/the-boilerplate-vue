import {
  CssExtractRspackPlugin,
  DefinePlugin,
  ProgressPlugin,
  SwcJsMinimizerRspackPlugin,
} from '@rspack/core';
import { BundleStatsWebpackPlugin } from 'bundle-stats-webpack-plugin';
import { RspackManifestPlugin } from 'rspack-manifest-plugin';
import { VueLoaderPlugin } from 'vue-loader';

import { generateManifest } from './utils';

export const vuePlugin = new VueLoaderPlugin();

export const definePlugin = new DefinePlugin({
  __VUE_OPTIONS_API__: true,
  __VUE_PROD_DEVTOOLS__: true,
  __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true,
});

export const cssExtractRspackPlugin = new CssExtractRspackPlugin({
  chunkFilename: 'public/css/chunk.[contenthash:8].css',
  filename: 'public/css/[name].[contenthash:8].css',
});

export const createManifestPlugin = (isSSR = false) =>
  new RspackManifestPlugin({
    fileName: isSSR ? 'ssr/manifest.json' : 'public/manifest.json',
    generate: isSSR ? undefined : generateManifest,
    useEntryKeys: isSSR,
  });

export const swcJsMinimizerRspackPlugin = new SwcJsMinimizerRspackPlugin({
  extractComments: false,
});

export const createProgressPlugin = (isSSR = false) =>
  new ProgressPlugin({
    prefix: isSSR ? '[[[ Compile for SSR ]]]' : '[[[ Compile for Browser ]]]',
  });

export const bundleStatsWebpackPlugin = new BundleStatsWebpackPlugin();
