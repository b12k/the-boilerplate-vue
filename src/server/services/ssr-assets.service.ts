import type { Render } from '@client';

import decache from 'decache';
import path from 'node:path';

import { env } from '../env';

export interface AssetsManifest {
  css: {
    async: Array<string>;
    initial: Array<string>;
  };
  js: {
    async: Array<string>;
    initial: Array<string>;
  };
}

type ImportedModule<T> = { default: T };

interface SsrAssets {
  manifest: AssetsManifest;
  render: Render;
}

type SsrAssetsLoader = () => Promise<SsrAssets>;

export const loadSsrAssets: SsrAssetsLoader = async () => {
  const [{ default: manifest }, { default: ssrManifest }, { default: render }] =
    (await Promise.all([
      import(env.CLIENT_MANIFEST_PATH),
      import(env.SSR_MANIFEST_PATH),
      import(env.SSR_RENDERER_PATH),
    ])) as [
      ImportedModule<AssetsManifest>,
      ImportedModule<AssetsManifest>,
      ImportedModule<Render>,
    ];

  if (env.IS_PROD !== 'true') {
    decache(env.CLIENT_MANIFEST_PATH);
    decache(env.SSR_RENDERER_PATH);
    Object.values(ssrManifest).forEach((entry) =>
      decache(path.resolve(env.ASSETS_LOCATION_PATH, String(entry))),
    );
  }

  return {
    manifest,
    render,
  };
};
