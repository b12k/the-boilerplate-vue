import { hostname } from 'node:os';
import path from 'node:path';
import { z } from 'zod';

/* oxlint-disable node/no-process-env -- Server environment variables are read and validated only in this module. */

const { dirname } = import.meta;
const DAY_SEC = 86_400;

const requiredStringSchema = z.string().min(1);
const optionalStringSchema = z.string().optional();
const envSchema = z.object({
  ACCEPTED_LANGUAGES: requiredStringSchema,
  CACHE: optionalStringSchema,
  CRITICAL_CSS_CACHE: optionalStringSchema,
  CRITICAL_CSS_CACHE_SALT: optionalStringSchema,
  CRITICAL_CSS_CACHE_TTL: z.string().default(DAY_SEC.toString()),
  DEBUG: optionalStringSchema,
  DEFAULT_LANGUAGE: requiredStringSchema,
  ENABLE_DEBUG: requiredStringSchema,
  LIVE_RELOAD_PATH: optionalStringSchema,
  LOG_LEVEL: optionalStringSchema,
  NODE_ENV: requiredStringSchema,
  npm_package_version: requiredStringSchema,
  PORT: requiredStringSchema,
  REDIS_URL: optionalStringSchema,
  RENDER_CACHE: optionalStringSchema,
  RENDER_CACHE_SALT: optionalStringSchema,
  RENDER_CACHE_TTL: z.string().default(DAY_SEC.toString()),
  SERVER_ENV: requiredStringSchema,
  WDS_PORT: optionalStringSchema,
});

const { npm_package_version: VERSION, ...variables } = envSchema.parse(
  process.env,
);

const IS_PROD = variables.NODE_ENV !== 'development';

const ASSETS_LOCATION_PATH = path.resolve(
  dirname,
  IS_PROD ? '../' : '../../dist',
);
const PUBLIC_PATH = path.resolve(ASSETS_LOCATION_PATH, 'public');
const CLIENT_MANIFEST_PATH = path.resolve(PUBLIC_PATH, 'manifest.json');
const SSR_RENDERER_PATH = path.resolve(ASSETS_LOCATION_PATH, 'ssr/index.cjs');
const SSR_MANIFEST_PATH = path.resolve(
  ASSETS_LOCATION_PATH,
  'ssr/manifest.json',
);
const VIEWS_PATH = path.resolve(dirname, 'views');
const FAVICON_PATH = path.resolve(PUBLIC_PATH, 'favicon.ico');
const HOSTNAME = hostname();

const env = {
  IS_OVERRIDDEN: false,
  ...variables,
  ASSETS_LOCATION_PATH,
  CLIENT_MANIFEST_PATH,
  CRITICAL_CSS_CACHE_SALT: variables.CRITICAL_CSS_CACHE_SALT ?? VERSION,
  FAVICON_PATH,
  HOSTNAME,
  IS_PROD,
  PUBLIC_PATH,
  RENDER_CACHE_SALT: variables.RENDER_CACHE_SALT ?? VERSION,
  SSR_MANIFEST_PATH,
  SSR_RENDERER_PATH,
  VERSION,
  VIEWS_PATH,
};

type Env = typeof env;

export { env, type Env };
