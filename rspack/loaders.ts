import { CssExtractRspackPlugin } from '@rspack/core';

import env from './env';

export const tsLoader = {
  exclude: [/node_modules/],
  loader: 'builtin:swc-loader',
  options: {
    jsc: {
      parser: {
        syntax: 'typescript',
      },
      target: 'esnext',
    },
    sourceMaps: true,
  },
  test: /\.ts$/,
  type: 'javascript/auto',
};

export const vueLoader = {
  loader: 'vue-loader',
  options: {
    experimentalInlineMatchResource: true,
  },
  test: /\.vue$/,
};

export const iconsLoader = {
  include: env.ICONS_FOLDER_PATH,
  test: /\.svg$/,
  type: 'asset/source',
};

export const cssLoader = {
  test: /\.css$/,
  type: 'javascript/auto',
  use: [
    env.IS_PROD ? CssExtractRspackPlugin.loader : 'vue-style-loader',
    { loader: 'css-loader', options: { sourceMap: true } },
    { loader: 'postcss-loader', options: { sourceMap: true } },
  ],
};

export const createImageLoader = (isSSR = false) => {
  const basePath = isSSR ? '/' : '';
  const hash = isSSR ? '' : '.[contenthash:8]';

  return {
    exclude: env.ICONS_FOLDER_PATH,
    generator: {
      emit: !isSSR,
      filename: `${basePath}public/images/[ext]/[name]${hash}.[ext]`,
    },
    parser: {
      dataUrlCondition: {
        maxSize: 24_000,
      },
    },
    test: /\.(png|gif|jpe?g|svg|webp)$/,
    type: 'asset',
  };
};

export const cssIgnoreLoader = {
  test: /\.css$/,
  use: ['ignore-loader'],
};
