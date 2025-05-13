import path from 'node:path';

const IS_PROD = process.env.NODE_ENV !== 'development';
const WDS_PORT = Number(process.env.WDS_PORT) || 8081;
const ICONS_FOLDER_PATH = path.resolve(__dirname, '../src/client/assets/icons');
const CONTEXT = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.resolve(__dirname, '../dist');
const OUTPUT_PUBLIC_PATH = IS_PROD ? '/' : `http://localhost:${WDS_PORT}/`;
const WITH_STATS = process.env.WITH_STATS === 'true';

export default {
  CONTEXT,
  ICONS_FOLDER_PATH,
  IS_PROD,
  OUTPUT_PATH,
  OUTPUT_PUBLIC_PATH,
  WDS_PORT,
  WITH_STATS,
};
