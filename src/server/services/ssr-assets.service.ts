import type { Render } from '@app/server.entry';

import { env } from '@server/env';
import { parseJson } from '@server/utils';
import decache from 'decache';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

type ClientManifest = Record<
  'css' | 'js',
  { async: Array<string>; initial: Array<string> }
> & { modules: Record<string, PageAssets> };

interface PageAssets {
  css: Array<string>;
  js: Array<string>;
}

function getPageAssets(
  clientManifest: ClientManifest,
  modules: Array<string>,
): PageAssets {
  const css = new Set(clientManifest.css.initial);
  const js = new Set(clientManifest.js.initial);
  for (const moduleId of modules) {
    const moduleAssets = clientManifest.modules[moduleId];
    for (const file of moduleAssets?.css ?? []) css.add(file);
    for (const file of moduleAssets?.js ?? []) js.add(file);
  }
  return { css: [...css], js: [...js] };
}

// Rspack emits the SSR renderer as CommonJS, including its development require cache.
const requireRenderer = createRequire(import.meta.url);

async function readSsrAssets() {
  const [clientManifestJson, ssrManifestJson] = await Promise.all([
    readFile(env.CLIENT_MANIFEST_PATH, 'utf8'),
    env.IS_PROD ? undefined : readFile(env.SSR_MANIFEST_PATH, 'utf8'),
  ]);
  const clientManifest = parseJson<ClientManifest>(clientManifestJson);
  const ssrManifest =
    ssrManifestJson === undefined
      ? undefined
      : parseJson<Record<string, string>>(ssrManifestJson);
  // This CommonJS module is built from the typed app entry in this codebase.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const { render } = requireRenderer(env.SSR_RENDERER_PATH) as {
    render: Render;
  };

  const assets = { manifest: clientManifest, render };
  if (ssrManifest === undefined) return assets;

  decache(env.SSR_RENDERER_PATH);
  for (const ssrModulePath of Object.values(ssrManifest)) {
    decache(path.resolve(env.ASSETS_LOCATION_PATH, ssrModulePath));
  }

  return assets;
}

// oxlint-disable-next-line init-declarations -- The snapshot is loaded on first use.
let productionAssetsPromise: ReturnType<typeof readSsrAssets> | undefined;

async function loadSsrAssets() {
  if (!env.IS_PROD) return readSsrAssets();

  productionAssetsPromise ??= readSsrAssets();
  const assetsLoadPromise = productionAssetsPromise;
  try {
    return await assetsLoadPromise;
  } catch (error) {
    if (productionAssetsPromise === assetsLoadPromise) {
      productionAssetsPromise = undefined;
    }
    throw error;
  }
}

export { type ClientManifest, getPageAssets, loadSsrAssets };
