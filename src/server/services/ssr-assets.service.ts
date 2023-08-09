import { resolve } from 'node:path';
import decache from 'decache';

import type { Render } from '@client';

import { env } from '../env';

export interface AssetsManifest {
  js: {
    initial: Array<string>;
    async: Array<string>;
  };
  css: {
    initial: Array<string>;
    async: Array<string>;
  };
}

interface SsrAssets {
  manifest: AssetsManifest;
  render: Render;
}

type ImportedModule<T> = { default: T };

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
      decache(resolve(env.ASSETS_LOCATION_PATH, String(entry))),
    );
  }

  return {
    manifest,
    render,
  };
};
