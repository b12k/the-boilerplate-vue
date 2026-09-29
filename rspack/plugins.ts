import {
  CssExtractRspackPlugin,
  DefinePlugin,
  ProgressPlugin,
  SwcJsMinimizerRspackPlugin,
} from '@rspack/core';
import { BundleStatsWebpackPlugin } from 'bundle-stats-webpack-plugin';
import { RspackManifestPlugin } from 'rspack-manifest-plugin';
import { VueLoaderPlugin } from 'vue-loader';

import env from './env';
import { generateManifest } from './utils';

export const vuePlugin = new VueLoaderPlugin();

export const definePlugin = new DefinePlugin({
  __VUE_OPTIONS_API__: true,
  __VUE_PROD_DEVTOOLS__: false,
  __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: !env.IS_PROD,
});

export const cssExtractRspackPlugin = new CssExtractRspackPlugin({
  chunkFilename: 'public/css/chunk.[contenthash:8].css',
  filename: 'public/css/[name].[contenthash:8].css',
});

export const createManifestPlugin = (isSSR = false) => {
  return new RspackManifestPlugin(
    isSSR
      ? { fileName: 'ssr/manifest.json', useEntryKeys: true }
      : {
          fileName: 'public/manifest.json',
          generate: generateManifest,
          useEntryKeys: false,
        },
  );
};

export const swcJsMinimizerRspackPlugin = new SwcJsMinimizerRspackPlugin({
  extractComments: false,
});

export const createProgressPlugin = (isSSR = false) => {
  return new ProgressPlugin({
    prefix: isSSR ? '[[[ Compile for SSR ]]]' : '[[[ Compile for Browser ]]]',
  });
};

export const bundleStatsWebpackPlugin = new BundleStatsWebpackPlugin();
