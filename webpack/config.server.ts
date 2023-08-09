import type { Configuration } from 'webpack';

import baseConfig from './config.base';
import { sassIgnoreLoader, createImageLoader } from './loaders';
import env from './env';
import { webpackSsrManifestPlugin } from './plugins';

const config: Configuration = {
  ...baseConfig,
  target: 'node',
  entry: {
    index: './src/client/entry.server.ts',
  },
  output: {
    filename: './ssr/index.js',
    library: {
      type: 'commonjs2',
    },
  },
  cache: {
    type: 'filesystem',
    cacheDirectory: env.CACHE_DIR,
    name: `server-${env.IS_PROD ? 'prod' : 'dev'}`,
  },
  module: {
    rules: [
      ...(baseConfig.module?.rules || []),
      sassIgnoreLoader,
      createImageLoader(true),
    ],
  },
  plugins: [...(baseConfig.plugins || []), webpackSsrManifestPlugin],
  devtool: false,
  watch: !env.IS_PROD,
  optimization: {
    minimize: false,
  },
};

export default config;
