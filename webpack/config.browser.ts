import 'webpack-dev-server';
import { resolve } from 'node:path';
import { Configuration } from 'webpack';
import baseConfig from './config.base';
import { sassLoader, createImageLoader } from './loaders';
import { getVendorName, getFilenameJs } from './utils';
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
    chunkFilename: getFilenameJs('chunk', env.IS_PROD),
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
      cacheGroups: {
        vendor: {
          chunks: 'initial',
          // enforce: true,
          test: /[/\\]node_modules[/\\]/,
          name: getVendorName,
          filename: getFilenameJs('vendor', env.IS_PROD),
        },
        async: {
          chunks: 'async',
          // enforce: true,
          minSize: 0,
          minChunks: 2,
          test: /[/\\]node_modules[/\\]/,
          name: getVendorName,
          filename: getFilenameJs('vendor', env.IS_PROD),
        },
      },
    },
  };
}

export default config;
