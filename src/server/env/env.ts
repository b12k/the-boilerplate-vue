import { readFile } from 'node:fs/promises';
import { hostname } from 'node:os';
import path from 'node:path';
import { z } from 'zod';

import { parseJson } from '../utils/parse-json';
import { envSchema } from './env-schema';

/* oxlint-disable node/no-process-env -- Server environment variables are read and validated only in this module. */
const envParseResult = envSchema.safeParse(process.env);
if (!envParseResult.success) {
  throw new Error(z.prettifyError(envParseResult.error));
}
const envVariables = envParseResult.data;
const redisUrl = new URL(
  `redis://${envVariables.REDIS_HOST}:${envVariables.REDIS_PORT}`,
);
if (envVariables.REDIS_PASSWORD) {
  redisUrl.username = 'default';
  redisUrl.password = encodeURIComponent(envVariables.REDIS_PASSWORD);
}
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
  CACHE_SALT: IS_PROD ? VERSION : Date.now().toString(),
  CLIENT_MANIFEST_PATH,
  DEBUG: !IS_PROD,
  FAVICON_PATH,
  HOSTNAME,
  IS_OVERRIDDEN: false,
  IS_PROD,
  PUBLIC_PATH,
  REDIS_URL: redisUrl.href,
  SSR_MANIFEST_PATH,
  SSR_RENDERER_PATH,
  VERSION,
  VIEWS_PATH,
};

type Env = typeof env;

export { env, type Env };
