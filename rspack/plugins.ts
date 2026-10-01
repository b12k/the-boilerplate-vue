import {
  CssExtractRspackPlugin,
  DefinePlugin,
  ProgressPlugin,
  SwcJsMinimizerRspackPlugin,
} from '@rspack/core';
import { BundleStatsWebpackPlugin } from 'bundle-stats-webpack-plugin';
import { RspackManifestPlugin } from 'rspack-manifest-plugin';
import { VueLoaderPlugin } from 'vue-loader';

import { env } from './env';
import { generateManifest } from './utils';

const vuePlugin = new VueLoaderPlugin();

const definePlugin = new DefinePlugin({
  __VUE_OPTIONS_API__: true,
  __VUE_PROD_DEVTOOLS__: false,
  __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: !env.IS_PROD,
});

const cssExtractRspackPlugin = new CssExtractRspackPlugin({
  chunkFilename: 'public/css/chunk.[contenthash:8].css',
  filename: 'public/css/[name].[contenthash:8].css',
});

function createManifestPlugin(isSSR = false) {
  return new RspackManifestPlugin(
    isSSR
      ? { fileName: 'ssr/manifest.json', useEntryKeys: true }
      : {
          fileName: 'public/manifest.json',
          generate: generateManifest,
          useEntryKeys: false,
        },
  );
}

const swcJsMinimizerRspackPlugin = new SwcJsMinimizerRspackPlugin({
  extractComments: false,
});

function createProgressPlugin(isSSR = false) {
  return new ProgressPlugin({
    prefix: isSSR ? '[[[ Compile for SSR ]]]' : '[[[ Compile for Browser ]]]',
  });
}

const bundleStatsWebpackPlugin = new BundleStatsWebpackPlugin();

export {
  bundleStatsWebpackPlugin,
  createManifestPlugin,
  createProgressPlugin,
  cssExtractRspackPlugin,
  definePlugin,
  swcJsMinimizerRspackPlugin,
  vuePlugin,
};
