import { RuleSetRule } from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import env from './env';

export const tsLoader: RuleSetRule = {
  test: /\.ts$/,
  loader: 'swc-loader',
  options: {
    jsc: {
      target: 'es2022',
      parser: {
        syntax: 'typescript',
      },
    },
    sourceMaps: false,
  },
};

export const vueLoader: RuleSetRule = {
  test: /\.vue$/,
  loader: 'vue-loader',
};

export const sassLoader: RuleSetRule = {
  test: /\.s?css$/,
  use: [
    env.IS_PROD ? MiniCssExtractPlugin.loader : 'vue-style-loader',
    { loader: 'css-loader', options: { sourceMap: env.IS_PROD } },
    { loader: 'postcss-loader', options: { sourceMap: env.IS_PROD } },
    { loader: 'sass-loader', options: { sourceMap: env.IS_PROD } },
  ],
};

export const sassIgnoreLoader: RuleSetRule = {
  test: /\.s?css$/,
  use: ['ignore-loader'],
};

export const iconsLoader: RuleSetRule = {
  test: /\.svg$/,
  include: env.ICONS_FOLDER_PATH,
  type: 'asset/source',
};

export const createImageLoader = (isSSR = false): RuleSetRule => ({
  test: /\.(png|gif|jpe?g|svg)$/,
  exclude: env.ICONS_FOLDER_PATH,
  use: [
    {
      loader: 'url-loader',
      options: {
        fallback: {
          loader: 'file-loader',
          options: {
            emitFile: !isSSR,
          },
        },
        limit: 24_000,
        name: `${isSSR ? '/' : ''}public/images/[ext]/[name]${
          env.IS_PROD ? '.[contenthash:8]' : ''
        }.[ext]`,
      },
    },
  ],
  type: 'javascript/auto',
});
