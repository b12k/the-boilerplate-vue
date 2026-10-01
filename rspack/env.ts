import path from 'node:path';

/* oxlint-disable node/no-process-env -- Rspack configuration reads environment variables only in this module. */

const __dirname = import.meta.dirname;

const IS_PROD = process.env['NODE_ENV'] !== 'development';
const WDS_PORT = Number(process.env['WDS_PORT']);
const ICONS_FOLDER_PATH = path.resolve(__dirname, '../src/client/assets/icons');
const CONTEXT = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.resolve(__dirname, '../dist');
const OUTPUT_PUBLIC_PATH = IS_PROD ? '/' : `http://localhost:${WDS_PORT}/`;
const IS_STATS_ENABLED = process.env['IS_STATS_ENABLED'] === 'true';
const IS_BUNDLER_CACHE_ENABLED =
  process.env['IS_BUNDLER_CACHE_ENABLED'] === 'true';

const env = {
  CONTEXT,
  ICONS_FOLDER_PATH,
  IS_BUNDLER_CACHE_ENABLED,
  IS_PROD,
  IS_STATS_ENABLED,
  OUTPUT_PATH,
  OUTPUT_PUBLIC_PATH,
  WDS_PORT,
};

export { env };
