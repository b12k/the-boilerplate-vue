import type { PathData } from '@rspack/core';

import { CssExtractRspackPlugin } from '@rspack/core';
import path from 'node:path';

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
  return {
    exclude: env.ICONS_FOLDER_PATH,
    generator: {
      emit: !isSSR,
      filename: (pathData: PathData) => {
        const extension = path.extname(pathData.filename ?? '').slice(1);
        return `public/images/${extension}/[name].[contenthash:8][ext]`;
      },
      publicPath: '/',
    },
    parser: {
      dataUrlCondition: {
        maxSize: 256_000,
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
