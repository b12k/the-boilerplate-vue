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

function reduceManifestFiles(assetPaths: Array<string>) {
  const assetPathsByType: { css: Array<string>; js: Array<string> } = {
    css: [],
    js: [],
  };
  for (const assetPath of assetPaths) {
    if (assetPath.endsWith('.js')) {
      assetPathsByType.js.push(assetPath);
    } else if (assetPath.endsWith('.css')) {
      assetPathsByType.css.push(assetPath);
    }
  }
  return assetPathsByType;
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
  const initialAssets = reduceManifestFiles(
    (entries['app'] ?? [])
      .map((entry) => {
        const entryFile = files.find((file) => file.path.includes(entry));
        return entryFile?.path ?? '';
      })
      .filter(Boolean),
  );
  const asyncAssets = reduceManifestFiles(
    files
      .filter(({ isInitial }) => !isInitial)
      .map(({ path: filePath }) => filePath),
  );
  return {
    css: {
      async: uniq(asyncAssets.css),
      initial: initialAssets.css,
    },
    js: {
      async: asyncAssets.js,
      initial: initialAssets.js,
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
  const packagePathMatch = module?.context
    ?.replaceAll('\\', '/')
    .match(/.*\/node_modules\/(?<packageName>(?:@[^/]+\/)?[^/]+)(?:\/|$)/u);

  return packagePathMatch?.groups?.['packageName'] ?? 'other';
}

export { generateManifest, getCacheConfig, getFilenameJs, getVendorName };
