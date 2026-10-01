import { hostname } from 'node:os';
import path from 'node:path';
import Surenv from 'surenv';

const __dirname = import.meta.dirname;
const DAY_SEC = 86_400;

// CommonJS exposes the constructor under default when loaded by Node's ESM loader.
function isDefaultModule(
  module: typeof Surenv | { default: typeof Surenv },
): module is { default: typeof Surenv } {
  return typeof module === 'object' && 'default' in module;
}
const EnvReader = isDefaultModule(Surenv) ? Surenv.default : Surenv;
const { optional, required } = new EnvReader();

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
  CRITICAL_CSS_CACHE_TTL = DAY_SEC.toString(),
  RENDER_CACHE_SALT = VERSION,
  RENDER_CACHE_TTL = DAY_SEC.toString(),
  ...optionalEnv
} = optional(
  'CACHE',
  'DEBUG',
  'WDS_PORT',
  'LOG_LEVEL',
  'REDIS_URL',
  'RENDER_CACHE',
  'LIVE_RELOAD_PATH',
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
const SSR_RENDERER_PATH = path.resolve(ASSETS_LOCATION_PATH, 'ssr/index.cjs');
const SSR_MANIFEST_PATH = path.resolve(
  ASSETS_LOCATION_PATH,
  'ssr/manifest.json',
);
const VIEWS_PATH = path.resolve(__dirname, 'views');
const FAVICON_PATH = path.resolve(PUBLIC_PATH, 'favicon.ico');
const HOSTNAME = hostname();

const env = {
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

type Env = typeof env;

export { env, type Env };
