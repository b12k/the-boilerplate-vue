import { resolve } from 'node:path';

const IS_PROD = process.env.NODE_ENV !== 'development';
const WDS_PORT = Number(process.env.WDS_PORT) || 8081;
const WITH_STATS = process.env.WITH_STATS === 'true';
const ICONS_FOLDER_PATH = resolve(__dirname, '..', './src/client/assets/icons');

export default {
  IS_PROD,
  WDS_PORT,
  WITH_STATS,
  ICONS_FOLDER_PATH,
};
