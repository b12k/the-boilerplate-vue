import { hostname } from 'node:os';
import path from 'node:path';

import { envSchema } from './env-schema';

/* oxlint-disable node/no-process-env -- Server environment variables are read and validated only in this module. */
const { npm_package_version: VERSION, ...envVariables } = envSchema.parse(
  process.env,
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
  CLIENT_MANIFEST_PATH,
  CRITICAL_CSS_CACHE_SALT: IS_PROD
    ? (envVariables.CRITICAL_CSS_CACHE_SALT ?? VERSION)
    : Date.now().toString(),
  FAVICON_PATH,
  HOSTNAME,
  IS_OVERRIDDEN: false,
  IS_PROD,
  PUBLIC_PATH,
  RENDER_CACHE_SALT: IS_PROD
    ? (envVariables.RENDER_CACHE_SALT ?? VERSION)
    : Date.now().toString(),
  SSR_MANIFEST_PATH,
  SSR_RENDERER_PATH,
  VERSION,
  VIEWS_PATH,
};

type Env = typeof env;

export { env, type Env };
