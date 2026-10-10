import type { Configuration } from '@rspack/core';

import { baseConfig } from './config.base';
import { env } from './env';
import { createImageLoader, cssLoader } from './loaders';
import {
  bundleStatsWebpackPlugin,
  createManifestPlugin,
  createProgressPlugin,
  cssExtractRspackPlugin,
  swcJsMinimizerRspackPlugin,
} from './plugins';
import { getCacheConfig, getFilenameJs, getVendorName } from './utils';

export default {
  ...baseConfig,
  cache: env.BUNDLER_CACHE && getCacheConfig('browser', env.IS_PROD),
  entry: {
    app: './src/app/browser.entry.ts',
  },
  module: {
    rules: [...baseConfig.module.rules, cssLoader, createImageLoader()],
  },
  output: {
    chunkFilename: getFilenameJs('chunk', env.IS_PROD),
    filename: getFilenameJs('[name]', env.IS_PROD),
    publicPath: env.OUTPUT_PUBLIC_PATH,
  },
  plugins: [
    ...baseConfig.plugins,
    createManifestPlugin(),
    createProgressPlugin(),
    ...(env.STATS_ENABLED ? [bundleStatsWebpackPlugin] : []),
    ...(env.IS_PROD
      ? [cssExtractRspackPlugin, swcJsMinimizerRspackPlugin]
      : []),
  ],
  ...(env.IS_PROD
    ? {
        optimization: {
          runtimeChunk: 'single',
          splitChunks: {
            cacheGroups: {
              async: {
                chunks: 'async',
                filename: getFilenameJs('vendor', env.IS_PROD),
                minChunks: 2,
                minSize: 0,
                name: getVendorName,
                test: /[/\\]node_modules[/\\]/u,
              },
              shared: {
                chunks: 'all',
                minChunks: 2,
                minSize: 0,
                name: 'shared',
                test: /[/\\]src[/\\]app[/\\]/u,
              },
              vendor: {
                chunks: 'all',
                filename: getFilenameJs('vendor', env.IS_PROD),
                name: getVendorName,
                test: /[/\\]node_modules[/\\]/u,
              },
            },
          },
        },
      }
    : {
        devServer: {
          devMiddleware: {
            writeToDisk: true,
          },
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Service-Worker-Allowed': '/',
          },
          hot: true,
          ...(env.WDS_PORT !== undefined && { port: env.WDS_PORT }),
        },
        lazyCompilation: env.WDS_PORT
          ? { serverUrl: `http://localhost:${env.WDS_PORT}` }
          : true,
      }),
} satisfies Configuration;
