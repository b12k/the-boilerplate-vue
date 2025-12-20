import { defineConfig } from '@rspack/cli';

import baseConfig from './config.base';
import env from './env';
import { createImageLoader, cssIgnoreLoader } from './loaders';
import { createManifestPlugin, createProgressPlugin } from './plugins';
import { getCacheConfig } from './utils';

const config = defineConfig({
  ...baseConfig,
  entry: {
    index: './src/client/entry.server.ts',
  },
  experiments: {
    cache: getCacheConfig('server', env.IS_PROD),
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
