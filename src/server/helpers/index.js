import path from 'path';
import axios from 'axios';

const {
  env: {
    NODE_ENV,
    PORT,
  },
} = process;

export const WDS_PORT = Number(PORT) + 1;

export const IS_PROD = NODE_ENV !== 'development';

export const resolvePath = (...args) => path.resolve(process.cwd(), ...args);

export const { version } = require(resolvePath('package.json')); // eslint-disable-line

export const wait = (timeoutMs = 0) => new Promise((resolve) => setTimeout(resolve, timeoutMs));

export const pingDevServer = () => axios.get(`http://localhost:${WDS_PORT}/public/json/clientManifest.json`);

export const waitDevServer = async (attempt = 0) => {
  if (attempt >= 60) throw new Error('Webpack Dev Server not running');
  try {
    await pingDevServer();
  } catch (e) {
    await wait(1000);
    await waitDevServer(attempt + 1);
  }
  console.log(`WDS is running on http://localhost:${WDS_PORT}`); // eslint-disable-line
};

export const appListenCallback = () => !IS_PROD && console.log(`SSR is running on http://localhost:${PORT}`); // eslint-disable-line

export getPageCacheConfig from './getPageCacheConfig';
