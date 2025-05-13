import { type Module } from '@rspack/core';
import { type ManifestPluginOptions } from 'rspack-manifest-plugin';

export const uniqArray = <T>(array: Array<T>) => [...new Set(array)];

export const getFilenameJs = (name: string, isProduction: boolean) =>
  isProduction ? `public/js/${name}.[contenthash:8].js` : `public/js/[name].js`;

export const getVendorName = (module?: Module) => {
  // Source https://medium.com/hackernoon/the-100-correct-way-to-split-your-chunks-with-webpack-f8a9df5b7758
  const matched = module?.context?.match(
    /[/\\]node_modules[/\\](.*?)([/\\]|$)/,
  );

  return matched ? matched[1].replace('@', '') : 'other';
};

const reduceManifestFiles = (array: Array<string>) =>
  array.reduce<{ css: Array<string>; js: Array<string> }>(
    (accumulator, next) => {
      if (/\.js$/.test(next)) {
        accumulator.js.push(next);
      } else if (/\.css$/.test(next)) {
        accumulator.css.push(next);
      }
      return accumulator;
    },
    { css: [], js: [] },
  );

export const generateManifest: ManifestPluginOptions['generate'] = (
  _,
  files,
  entries,
) => {
  const initial = reduceManifestFiles(
    entries.app
      .map((entry) => {
        const entryFile = files.find((file) => file.path.match(entry));
        return entryFile?.path || '';
      })
      .filter(Boolean),
  );
  const async = reduceManifestFiles(
    files.filter(({ isInitial }) => !isInitial).map(({ path }) => path),
  );
  return {
    css: {
      async: uniqArray(async.css),
      initial: initial.css,
    },
    js: {
      async: async.js,
      initial: initial.js,
    },
  };
};
