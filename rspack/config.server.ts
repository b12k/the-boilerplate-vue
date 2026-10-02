import type { Configuration } from '@rspack/core';

import { baseConfig } from './config.base';
import { env } from './env';
import { createImageLoader, cssIgnoreLoader } from './loaders';
import { createManifestPlugin, createProgressPlugin } from './plugins';
import { getCacheConfig } from './utils';

export default {
  ...baseConfig,
  cache: env.IS_BUNDLER_CACHE_ENABLED && getCacheConfig('server', env.IS_PROD),
  devtool: 'source-map',
  entry: {
    index: './src/app/server.entry.ts',
  },
  externals: [
    ({ request }, resolveExternal) => {
      if (
        !request ||
        request.startsWith('.') ||
        request.startsWith('@app/') ||
        request.startsWith('@server/')
      ) {
        resolveExternal();
        return;
      }

      resolveExternal(undefined, `commonjs ${request}`);
    },
  ],
  externalsPresets: {
    node: true,
  },
  module: {
    rules: [
      ...baseConfig.module.rules,
      createImageLoader(true),
      cssIgnoreLoader,
    ],
  },
  optimization: {
    minimize: false,
  },
  output: {
    chunkFilename: './ssr/[id].cjs',
    filename: './ssr/index.cjs',
    library: {
      type: 'commonjs2',
    },
  },
  plugins: [
    ...baseConfig.plugins,
    createManifestPlugin(true),
    createProgressPlugin(true),
  ],
  target: 'node',
  watch: !env.IS_PROD,
} satisfies Configuration;
