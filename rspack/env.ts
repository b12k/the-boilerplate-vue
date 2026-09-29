import path from 'node:path';

const IS_PROD = process.env['NODE_ENV'] !== 'development';
const WDS_PORT = Number(process.env['WDS_PORT']) || 8081;
const ICONS_FOLDER_PATH = path.resolve(__dirname, '../src/client/assets/icons');
const CONTEXT = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.resolve(__dirname, '../dist');
const OUTPUT_PUBLIC_PATH = IS_PROD ? '/' : `http://localhost:${WDS_PORT}/`;
const IS_STATS_ENABLED = process.env['IS_STATS_ENABLED'] === 'true';
const IS_BUNDLER_CACHE_ENABLED =
  process.env['IS_BUNDLER_CACHE_ENABLED'] === 'true';

export default {
  CONTEXT,
  ICONS_FOLDER_PATH,
  IS_BUNDLER_CACHE_ENABLED,
  IS_PROD,
  IS_STATS_ENABLED,
  OUTPUT_PATH,
  OUTPUT_PUBLIC_PATH,
  WDS_PORT,
};
