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

const plugins: NonNullable<Configuration['plugins']> = [
  ...baseConfig.plugins,
  createManifestPlugin(),
  createProgressPlugin(),
];

const config: Configuration = {
  ...baseConfig,
  cache: env.IS_BUNDLER_CACHE_ENABLED && getCacheConfig('browser', env.IS_PROD),
  entry: {
    app: './src/client/entry.browser.ts',
  },
  module: {
    rules: [...baseConfig.module.rules, cssLoader, createImageLoader()],
  },
  output: {
    chunkFilename: getFilenameJs('chunk', env.IS_PROD),
    filename: getFilenameJs('[name]', env.IS_PROD),
    publicPath: env.OUTPUT_PUBLIC_PATH,
  },
  plugins,
};

if (env.IS_STATS_ENABLED) {
  plugins.push(bundleStatsWebpackPlugin);
}

if (env.IS_PROD) {
  plugins.push(cssExtractRspackPlugin, swcJsMinimizerRspackPlugin);
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
          test: /[/\\]node_modules[/\\]/u,
        },
        vendor: {
          chunks: 'all',
          filename: getFilenameJs('vendor', env.IS_PROD),
          name: getVendorName,
          test: /[/\\]node_modules[/\\]/u,
        },
      },
    },
  };
} else {
  config.devServer = {
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

  config.lazyCompilation = {
    serverUrl: `http://localhost:${env.WDS_PORT}`,
  };
}

export default config;
