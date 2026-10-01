import { env } from '@server/env';
import decache from 'decache';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { z } from 'zod';

import type { Render } from '~/index';

const filesSchema = z.object({
  async: z.array(z.string()),
  initial: z.array(z.string()),
});
const assetsSchema = z.object({
  css: filesSchema,
  js: filesSchema,
});
const ssrManifestSchema = z.record(z.string(), z.string());
const rendererSchema = z.object({
  render: z.custom<Render>((value: unknown) => typeof value === 'function'),
});

// Rspack emits the SSR renderer as CommonJS, including its development require cache.
const requireRenderer = createRequire(import.meta.url);

type AssetsManifest = z.infer<typeof assetsSchema>;

async function loadSsrAssets() {
  const [manifestJson, ssrManifestJson] = await Promise.all([
    readFile(env.CLIENT_MANIFEST_PATH, 'utf8'),
    readFile(env.SSR_MANIFEST_PATH, 'utf8'),
  ]);
  const manifest = assetsSchema.parse(JSON.parse(manifestJson));
  const ssrManifest = ssrManifestSchema.parse(JSON.parse(ssrManifestJson));
  const rendererModule: unknown = requireRenderer(env.SSR_RENDERER_PATH);
  const { render } = rendererSchema.parse(rendererModule);

  const assets = { manifest, render };
  if (env.IS_PROD === 'true') return assets;

  decache(env.SSR_RENDERER_PATH);
  for (const entry of Object.values(ssrManifest)) {
    decache(path.resolve(env.ASSETS_LOCATION_PATH, entry));
  }

  return assets;
}

export { type AssetsManifest, loadSsrAssets };
