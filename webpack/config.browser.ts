import 'webpack-dev-server';
import { Configuration } from 'webpack';
import { resolve } from 'node:path';
import baseConfig from './config.base';
import { sassLoader, createImageLoader } from './loaders';
import { computeChunkName, getFilenameJs } from './utils';
import {
  miniCssExtractPlugin,
  terserPlugin,
  webpackClientManifestPlugin,
  webpackProgressPlugin,
  bundleStatsWebpackPlugin,
} from './plugins';
import env from './env';

const config: Configuration = {
  ...baseConfig,
  entry: {
    app: './src/client/entry.browser.ts',
  },
  output: {
    path: resolve(__dirname, '../dist'),
    publicPath: env.IS_PROD ? '/' : `http://localhost:${env.WDS_PORT}/`,
    filename: getFilenameJs('[name]', env.IS_PROD),
    chunkFilename: getFilenameJs('[name]', env.IS_PROD),
  },
  cache: {
    type: 'filesystem',
    cacheDirectory: env.CACHE_DIR,
    name: `browser-${env.IS_PROD ? 'prod' : 'dev'}`,
  },
  module: {
    rules: [
      ...(baseConfig.module?.rules || []),
      sassLoader,
      createImageLoader(),
    ],
  },
  plugins: [
    ...(baseConfig.plugins || []),
    webpackClientManifestPlugin,
    webpackProgressPlugin,
    ...(env.IS_PROD ? [miniCssExtractPlugin, terserPlugin] : []),
    ...(env.WITH_STATS ? [bundleStatsWebpackPlugin] : []),
  ],
  stats: {
    colors: true,
    preset: 'normal',
  },
  devServer: {
    devMiddleware: {
      writeToDisk: (file) => !file.includes('hot-update'),
    },
    client: {
      overlay: {
        warnings: false,
      },
    },
    hot: true,
    port: env.WDS_PORT,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  performance: {
    hints: false,
  },
  devtool: env.IS_PROD ? 'source-map' : false,
};

if (env.IS_PROD) {
  config.optimization = {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[/\\]node_modules[/\\]/,
          name: computeChunkName('vendor'),
        },
      },
    },
  };
}

export default config;
