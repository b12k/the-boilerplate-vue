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
>;

// Rspack emits the SSR renderer as CommonJS, including its development require cache.
const requireRenderer = createRequire(import.meta.url);

async function readSsrAssets() {
  const [manifestJson, ssrManifestJson] = await Promise.all([
    readFile(env.CLIENT_MANIFEST_PATH, 'utf8'),
    env.IS_PROD ? undefined : readFile(env.SSR_MANIFEST_PATH, 'utf8'),
  ]);
  const manifest = parseJson<ClientManifest>(manifestJson);
  const ssrManifest =
    ssrManifestJson === undefined
      ? undefined
      : parseJson<Record<string, string>>(ssrManifestJson);
  // This CommonJS module is built from the typed app entry in this codebase.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const { render } = requireRenderer(env.SSR_RENDERER_PATH) as {
    render: Render;
  };

  const assets = { manifest, render };
  if (ssrManifest === undefined) return assets;

  decache(env.SSR_RENDERER_PATH);
  for (const entry of Object.values(ssrManifest)) {
    decache(path.resolve(env.ASSETS_LOCATION_PATH, entry));
  }

  return assets;
}

// oxlint-disable-next-line init-declarations -- The snapshot is loaded on first use.
let productionAssetsPromise: ReturnType<typeof readSsrAssets> | undefined;

async function loadSsrAssets() {
  if (!env.IS_PROD) return readSsrAssets();

  productionAssetsPromise ??= readSsrAssets();
  const pending = productionAssetsPromise;
  try {
    return await pending;
  } catch (error) {
    if (productionAssetsPromise === pending) {
      productionAssetsPromise = undefined;
    }
    throw error;
  }
}

export { type ClientManifest, loadSsrAssets };
