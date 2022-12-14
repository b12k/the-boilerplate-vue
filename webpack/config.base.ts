import { Configuration } from 'webpack';

import { tsLoader, vueLoader, iconsLoader } from './loaders';
import {
  vueLoaderPlugin,
  webpackDefinePlugin,
  tsConfigPathsPlugin,
} from './plugins';
import env from './env';

const config: Configuration = {
  mode: env.IS_PROD ? 'production' : 'development',
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [tsConfigPathsPlugin],
  },
  module: {
    rules: [tsLoader, vueLoader, iconsLoader],
  },
  plugins: [vueLoaderPlugin, webpackDefinePlugin],
};

export default config;
