import type { Compilation, Module, PersistentCacheOptions } from '@rspack/core';
import type { ClientManifest } from '@server/services/ssr-assets.service';
import type { FileDescriptor } from 'rspack-manifest-plugin';

import { uniq } from 'es-toolkit/array';
import path from 'node:path';

import { env } from './env';

function getModuleAssetPaths(
  module: Module,
  compilation: Compilation,
  files: Array<FileDescriptor>,
) {
  const moduleFiles = new Set<string>();
  for (const chunk of compilation.chunkGraph.getModuleChunksIterable(module)) {
    const groups = [...chunk.groupsIterable];
    const onlyGroup = groups.length === 1 ? groups[0] : undefined;
    // A shared chunk belongs to several routes; their other chunks are unrelated.
    const chunkFiles = onlyGroup ? onlyGroup.getFiles() : [...chunk.files];
    for (const filename of chunkFiles) {
      const file = files.find((descriptor) =>
        descriptor.path.endsWith(filename),
      );
      if (file) moduleFiles.add(file.path);
    }
  }
  return [...moduleFiles];
}

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

function generateModuleAssets(
  compilation: Compilation,
  files: Array<FileDescriptor>,
) {
  const modules: ClientManifest['modules'] = {};
  for (const module of compilation.modules) {
    const resourcePath = module.nameForCondition()?.split('?')[0];
    if (resourcePath?.endsWith('.vue')) {
      const moduleId = path
        .relative(env.CONTEXT, resourcePath)
        .replaceAll('\\', '/');
      const previousFiles = modules[moduleId];
      const assets = reduceManifestFiles(
        getModuleAssetPaths(module, compilation, files),
      );
      modules[moduleId] = {
        css: uniq([...(previousFiles?.css ?? []), ...assets.css]),
        js: uniq([...(previousFiles?.js ?? []), ...assets.js]),
      };
    }
  }
  return modules;
}

function generateManifest(
  _: Record<string, unknown>,
  files: Array<FileDescriptor>,
  entries: Record<string, Array<string>>,
  { compilation }: { compilation: Compilation },
): ClientManifest {
  const initial = reduceManifestFiles(
    (entries['app'] ?? [])
      .map((entry) => {
        const entryFile = files.find((file) => file.path.includes(entry));
        return entryFile?.path ?? '';
      })
      .filter(Boolean),
  );
  const async = reduceManifestFiles(
    files
      .filter(({ isInitial }) => !isInitial)
      .map(({ path: filePath }) => filePath),
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
    modules: generateModuleAssets(compilation, files),
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
