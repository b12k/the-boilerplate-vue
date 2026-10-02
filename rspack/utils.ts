import type { Module, PersistentCacheOptions } from '@rspack/core';
import type { FileDescriptor } from 'rspack-manifest-plugin';

import { uniq } from 'es-toolkit/array';

function reduceManifestFiles(array: Array<string>) {
  const files: { css: Array<string>; js: Array<string> } = { css: [], js: [] };
  for (const file of array) {
    if (file.endsWith('.js')) {
      files.js.push(file);
    } else if (file.endsWith('.css')) {
      files.css.push(file);
    }
  }
  return files;
}

function generateManifest(
  _: Record<string, unknown>,
  files: Array<FileDescriptor>,
  entries: Record<string, Array<string>>,
) {
  const initial = reduceManifestFiles(
    (entries['app'] ?? [])
      .map((entry) => {
        const entryFile = files.find((file) => file.path.includes(entry));
        return entryFile?.path ?? '';
      })
      .filter(Boolean),
  );
  const async = reduceManifestFiles(
    files.filter(({ isInitial }) => !isInitial).map(({ path }) => path),
  );
  return {
    css: {
      async: uniq(async.css),
      initial: initial.css,
    },
    js: {
      async: async.js,
      initial: initial.js,
    },
  };
}

function getCacheConfig(target: 'browser' | 'server', isProduction: boolean) {
  return {
    storage: {
      directory: `node_modules/.cache/rspack/${target}/${isProduction ? 'prod' : 'dev'}`,
      type: 'filesystem',
    },
    type: 'persistent',
  } satisfies PersistentCacheOptions;
}

function getFilenameJs(name: string, isProduction: boolean) {
  return isProduction
    ? `public/js/${name}.[contenthash:8].js`
    : `public/js/[name].js`;
}

function getVendorName(module?: Module) {
  // Source https://medium.com/hackernoon/the-100-correct-way-to-split-your-chunks-with-webpack-f8a9df5b7758
  const matched = module?.context?.match(
    /[/\\]node_modules[/\\](?<packageName>.*?)(?:[/\\]|$)/u,
  );

  return matched?.groups?.['packageName']?.replace('@', '') ?? 'other';
}

export { generateManifest, getCacheConfig, getFilenameJs, getVendorName };
