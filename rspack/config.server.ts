import { defineConfig } from '@rspack/cli';

import baseConfig from './config.base';
import env from './env';
import { createImageLoader, cssIgnoreLoader } from './loaders';
import { createManifestPlugin, createProgressPlugin } from './plugins';
import { getCacheConfig } from './utils';

const config = defineConfig({
  ...baseConfig,
  cache: env.IS_BUNDLER_CACHE_ENABLED && getCacheConfig('server', env.IS_PROD),
  devtool: 'source-map',
  entry: {
    index: './src/client/entry.server.ts',
  },
  externals: [
    ({ request }, callback) => {
      const isExternal =
        request &&
        !request.startsWith('.') &&
        !request.startsWith('@client') &&
        !request.startsWith('@server');

      return isExternal
        ? callback(undefined, `commonjs ${request}`)
        : callback();
    },
  ],
  externalsPresets: {
    node: true,
  },
  module: {
    rules: [
      ...(baseConfig.module?.rules || []),
      createImageLoader(true),
      cssIgnoreLoader,
    ],
  },
  optimization: {
    minimize: false,
  },
  output: {
    filename: './ssr/index.js',
    library: {
      type: 'commonjs2',
    },
  },
  plugins: [
    ...(baseConfig.plugins || []),
    createManifestPlugin(true),
    createProgressPlugin(true),
  ],
  target: 'node',
  watch: !env.IS_PROD,
});

export default config;
