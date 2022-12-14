import { Configuration } from 'webpack';
import webpackNodeExternals from 'webpack-node-externals';

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
  externals: webpackNodeExternals(),
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
};

export default config;
