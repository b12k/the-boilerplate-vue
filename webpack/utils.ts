import { Module } from 'webpack';
import { ManifestPluginOptions } from 'webpack-manifest-plugin';

export const uniqArray = <T>(array: Array<T>) => [...new Set(array)];

export const getFilenameJs = (name: string, isProduction: boolean) =>
  isProduction ? `public/js/${name}.[contenthash:8].js` : `public/js/[name].js`;
export const getVendorName = ({ context }: Module) => {
  // Source https://medium.com/hackernoon/the-100-correct-way-to-split-your-chunks-with-webpack-f8a9df5b7758
  const matched = context?.match(/[/\\]node_modules[/\\](.*?)([/\\]|$)/);

  return matched ? matched[1].replace('@', '') : 'other';
};

const reduceManifestFiles = (array: Array<string>) =>
  array.reduce<{ js: Array<string>; css: Array<string> }>(
    (acc, next) => {
      if (/\.js$/.test(next)) {
        acc.js.push(next);
      } else if (/\.css$/.test(next)) {
        acc.css.push(next);
      }
      return acc;
    },
    { js: [], css: [] },
  );

export const generateManifest: ManifestPluginOptions['generate'] = (
  seed,
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
    js: {
      initial: initial.js,
      async: async.js,
    },
    css: {
      initial: initial.css,
      async: uniqArray(async.css),
    },
  };
};
