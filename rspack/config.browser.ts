import type { ExperimentCacheOptions } from '@rspack/core';

import { defineConfig } from '@rspack/cli';

import baseConfig from './config.base';
import env from './env';
import { createImageLoader, scssLoader } from './loaders';
import {
  bundleStatsWebpackPlugin,
  createManifestPlugin,
  createProgressPlugin,
  cssExtractRspackPlugin,
  swcJsMinimizerRspackPlugin,
} from './plugins';
import { getFilenameJs, getVendorName } from './utils';

const cache = {
  storage: {
    directory: `.temp/rspack/browser/${env.IS_PROD ? 'prod' : 'dev'}`,
    type: 'filesystem',
  },
  type: 'persistent',
} as ExperimentCacheOptions;

const config = defineConfig({
  ...baseConfig,
  entry: {
    app: './src/client/entry.browser.ts',
  },
  experiments: {
    cache,
    css: false,
  },
  module: {
    rules: [
      ...(baseConfig.module?.rules || []),
      scssLoader,
      createImageLoader(),
    ],
  },
  output: {
    chunkFilename: getFilenameJs('chunk', env.IS_PROD),
    filename: getFilenameJs('[name]', env.IS_PROD),
    path: env.OUTPUT_PATH,
    publicPath: env.OUTPUT_PUBLIC_PATH,
  },
  plugins: [
    ...(baseConfig.plugins || []),
    createManifestPlugin(),
    createProgressPlugin(),
  ],
});

if (env.WITH_STATS) {
  config.plugins = [...(config.plugins || []), bundleStatsWebpackPlugin];
}

if (env.IS_PROD) {
  config.plugins = [
    ...(config.plugins || []),
    cssExtractRspackPlugin,
    swcJsMinimizerRspackPlugin,
  ];
  config.optimization = {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        async: {
          chunks: 'async',
          filename: getFilenameJs('vendor', env.IS_PROD),
          minChunks: 2,
          minSize: 0,
          name: getVendorName,
          test: /[/\\]node_modules[/\\]/,
        },
        vendor: {
          chunks: 'all',
          filename: getFilenameJs('vendor', env.IS_PROD),
          name: getVendorName,
          test: /[/\\]node_modules[/\\]/,
        },
      },
    },
  };
} else {
  config.devServer = {
    client: {
      overlay: {
        warnings: false,
      },
    },
    devMiddleware: {
      writeToDisk: true,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Service-Worker-Allowed': '/',
    },
    hot: true,
    port: env.WDS_PORT,
  };
}

export default config;
