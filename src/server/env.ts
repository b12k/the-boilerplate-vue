import Surenv from 'surenv';
import { resolve } from 'node:path';
import { hostname } from 'node:os';

const { required, optional } = new Surenv();

const {
  PORT,
  DEBUG,
  NODE_ENV,
  npm_package_version: VERSION,
  ...publicEnvironmentVariables
} = required(
  'PORT',
  'DEBUG',
  'NODE_ENV',
  'SERVER_ENV',
  'DEFAULT_LANGUAGE',
  'ACCEPTED_LANGUAGES',
  'npm_package_version',
);

const optionalEnvironment = optional(
  'CACHE_TTL',
  'REDIS_HOST',
  'REDIS_PORT',
  'REDIS_USER',
  'REDIS_PASSWORD',
  'DISABLE_LOG',
  'ENABLE_DEBUG',
  'CACHE_ENABLED',
  'CACHE_KEY_SALT',
);

const IS_PROD = NODE_ENV !== 'development';
const ASSETS_LOCATION_PATH = resolve(__dirname, IS_PROD ? '.' : '../../dist');
const PUBLIC_PATH = resolve(ASSETS_LOCATION_PATH, 'public');
const CLIENT_MANIFEST_PATH = resolve(PUBLIC_PATH, 'manifest.json');
const SSR_RENDERER_PATH = resolve(ASSETS_LOCATION_PATH, 'ssr');
const SSR_MANIFEST_PATH = resolve(SSR_RENDERER_PATH, 'manifest.json');
const VIEWS_PATH = resolve(__dirname, 'views');
const FAVICON_PATH = resolve(PUBLIC_PATH, 'favicon.ico');
const HOSTNAME = hostname();

const REDIS_URL =
  optionalEnvironment.REDIS_HOST &&
  optionalEnvironment.REDIS_PORT &&
  optionalEnvironment.REDIS_USER &&
  optionalEnvironment.REDIS_PASSWORD &&
  `redis://${optionalEnvironment.REDIS_USER}:${optionalEnvironment.REDIS_PASSWORD}@${optionalEnvironment.REDIS_HOST}:${optionalEnvironment.REDIS_PORT}`;

export const envPublic = {
  ...publicEnvironmentVariables,
  IS_PROD,
  VERSION,
};

export const env = {
  ...envPublic,
  ...optionalEnvironment,
  PORT,
  DEBUG,
  HOSTNAME,
  REDIS_URL,
  VIEWS_PATH,
  PUBLIC_PATH,
  FAVICON_PATH,
  CLIENT_MANIFEST_PATH,
  SSR_RENDERER_PATH,
  SSR_MANIFEST_PATH,
  ASSETS_LOCATION_PATH,
};

export type Env = typeof env;
export type EnvPublic = typeof envPublic & { IS_OVERRIDDEN?: 'true' | 'false' };
