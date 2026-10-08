import { readFile } from 'node:fs/promises';
import { hostname } from 'node:os';
import path from 'node:path';
import { z } from 'zod';

import { parseJson } from '../utils/parse-json';
import { envSchema } from './env-schema';

/* oxlint-disable node/no-process-env -- Server environment variables are read and validated only in this module. */
const result = envSchema.safeParse(process.env);
if (!result.success) {
  throw new Error(z.prettifyError(result.error));
}
const envVariables = result.data;
const { version: VERSION } = parseJson<{ version: string }>(
  await readFile(new URL('../../../package.json', import.meta.url), 'utf8'),
);
const { dirname } = import.meta;
const serverDirname = path.resolve(dirname, '..');
const IS_PROD = envVariables.NODE_ENV !== 'development';
const ASSETS_LOCATION_PATH = path.resolve(
  serverDirname,
  IS_PROD ? '../' : '../../dist',
);
const PUBLIC_PATH = path.resolve(ASSETS_LOCATION_PATH, 'public');
const CLIENT_MANIFEST_PATH = path.resolve(PUBLIC_PATH, 'manifest.json');
const SSR_RENDERER_PATH = path.resolve(ASSETS_LOCATION_PATH, 'ssr/index.cjs');
const SSR_MANIFEST_PATH = path.resolve(
  ASSETS_LOCATION_PATH,
  'ssr/manifest.json',
);
const VIEWS_PATH = path.resolve(serverDirname, 'views');
const FAVICON_PATH = path.resolve(PUBLIC_PATH, 'favicon.ico');
const HOSTNAME = hostname();

const env = {
  ...envVariables,
  ASSETS_LOCATION_PATH,
  CACHE_CRITICAL_CSS_SALT: IS_PROD
    ? (envVariables.CACHE_CRITICAL_CSS_SALT ?? VERSION)
    : Date.now().toString(),
  CACHE_RENDER_SALT: IS_PROD
    ? (envVariables.CACHE_RENDER_SALT ?? VERSION)
    : Date.now().toString(),
  CLIENT_MANIFEST_PATH,
  FAVICON_PATH,
  HOSTNAME,
  IS_OVERRIDDEN: false,
  IS_PROD,
  PUBLIC_PATH,
  SSR_MANIFEST_PATH,
  SSR_RENDERER_PATH,
  VERSION,
  VIEWS_PATH,
};

type Env = typeof env;

export { env, type Env };
