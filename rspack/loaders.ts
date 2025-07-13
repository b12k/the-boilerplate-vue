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
    sourceMaps: env.IS_PROD,
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
  // type: 'css',
  type: 'javascript/auto',
  use: [
    env.IS_PROD ? CssExtractRspackPlugin.loader : 'vue-style-loader',
    { loader: 'css-loader', options: { sourceMap: env.IS_PROD } },
    { loader: 'postcss-loader', options: { sourceMap: env.IS_PROD } },
  ],
};

export const createImageLoader = (isSSR = false) => {
  const basePath = isSSR ? '/' : '';
  const hash = isSSR ? '' : '.[contenthash:8]';

  return {
    exclude: env.ICONS_FOLDER_PATH,
    test: /\.(png|gif|jpe?g|svg|webp)$/,
    type: 'javascript/auto',
    use: [
      {
        loader: 'url-loader',
        options: {
          esModule: false,
          fallback: {
            loader: 'file-loader',
            options: {
              emitFile: !isSSR,
              esModule: false,
            },
          },
          limit: 24_000,
          name: `${basePath}public/images/[ext]/[name]${hash}.[ext]`,
        },
      },
    ],
  };
};

export const cssIgnoreLoader = {
  test: /\.css$/,
  use: ['ignore-loader'],
};
