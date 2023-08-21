import { resolve } from 'node:path';
import { hostname } from 'node:os';
import { configDotenv } from 'dotenv';
import Surenv from 'surenv';

configDotenv();

const { required, optional } = new Surenv();

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
  RENDER_CACHE_TTL = (60 * 60 * 24).toString(), // 1 day
  RENDER_CACHE_SALT = VERSION,
  CRITICAL_CSS_CACHE_TTL = (60 * 60 * 24).toString(), // 1 day
  CRITICAL_CSS_CACHE_SALT = VERSION,
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

const ASSETS_LOCATION_PATH = resolve(
  __dirname,
  IS_PROD === 'true' ? '../' : '../../dist',
);
const PUBLIC_PATH = resolve(ASSETS_LOCATION_PATH, 'public');
const CLIENT_MANIFEST_PATH = resolve(PUBLIC_PATH, 'manifest.json');
const SSR_RENDERER_PATH = resolve(ASSETS_LOCATION_PATH, 'ssr');
const SSR_MANIFEST_PATH = resolve(SSR_RENDERER_PATH, 'manifest.json');
const VIEWS_PATH = resolve(__dirname, 'views');
const FAVICON_PATH = resolve(PUBLIC_PATH, 'favicon.ico');
const HOSTNAME = hostname();

export const env = {
  IS_OVERRIDDEN: 'false',
  ...requiredEnv,
  ...optionalEnv,
  IS_PROD,
  VERSION,
  PUBLIC_PATH,
  ASSETS_LOCATION_PATH,
  CLIENT_MANIFEST_PATH,
  SSR_MANIFEST_PATH,
  SSR_RENDERER_PATH,
  VIEWS_PATH,
  FAVICON_PATH,
  HOSTNAME,
  RENDER_CACHE_SALT,
  RENDER_CACHE_TTL,
  CRITICAL_CSS_CACHE_SALT,
  CRITICAL_CSS_CACHE_TTL,
};

export type Env = typeof env;
