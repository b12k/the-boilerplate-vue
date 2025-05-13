import { hostname } from 'node:os';
import path from 'node:path';
import Surenv from 'surenv';

const { optional, required } = new Surenv();

const { npm_package_version: VERSION, ...requiredEnv } = required(
  'PORT',
  'ENABLE_DEBUG',
  'NODE_ENV',
  'SERVER_ENV',
  'DEFAULT_LANGUAGE',
  'ACCEPTED_LANGUAGES',
  'npm_package_version',
);

const {
  CRITICAL_CSS_CACHE_SALT = VERSION,
  CRITICAL_CSS_CACHE_TTL = (60 * 60 * 24).toString(), // 1 day
  RENDER_CACHE_SALT = VERSION,
  RENDER_CACHE_TTL = (60 * 60 * 24).toString(), // 1 day
  ...optionalEnv
} = optional(
  'CACHE',
  'DEBUG',
  'WDS_PORT',
  'LOG_LEVEL',
  'REDIS_URL',
  'RENDER_CACHE',
  'RENDER_CACHE_TTL',
  'RENDER_CACHE_SALT',
  'CRITICAL_CSS_CACHE',
  'CRITICAL_CSS_CACHE_TTL',
  'CRITICAL_CSS_CACHE_SALT',
);

const IS_PROD = String(requiredEnv.NODE_ENV !== 'development');

const ASSETS_LOCATION_PATH = path.resolve(
  __dirname,
  IS_PROD === 'true' ? '../' : '../../dist',
);
const PUBLIC_PATH = path.resolve(ASSETS_LOCATION_PATH, 'public');
const CLIENT_MANIFEST_PATH = path.resolve(PUBLIC_PATH, 'manifest.json');
const SSR_RENDERER_PATH = path.resolve(ASSETS_LOCATION_PATH, 'ssr');
const SSR_MANIFEST_PATH = path.resolve(SSR_RENDERER_PATH, 'manifest.json');
const VIEWS_PATH = path.resolve(__dirname, 'views');
const FAVICON_PATH = path.resolve(PUBLIC_PATH, 'favicon.ico');
const HOSTNAME = hostname();

export const env = {
  IS_OVERRIDDEN: 'false',
  ...requiredEnv,
  ...optionalEnv,
  ASSETS_LOCATION_PATH,
  CLIENT_MANIFEST_PATH,
  CRITICAL_CSS_CACHE_SALT,
  CRITICAL_CSS_CACHE_TTL,
  FAVICON_PATH,
  HOSTNAME,
  IS_PROD,
  PUBLIC_PATH,
  RENDER_CACHE_SALT,
  RENDER_CACHE_TTL,
  SSR_MANIFEST_PATH,
  SSR_RENDERER_PATH,
  VERSION,
  VIEWS_PATH,
};

export type Env = typeof env;
