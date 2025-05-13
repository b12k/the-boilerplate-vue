import { defineConfig } from '@rspack/cli';

import env from './env';
import { iconsLoader, tsLoader, vueLoader } from './loaders';
import { definePlugin, vuePlugin } from './plugins';

export default defineConfig({
  cache: true,
  context: env.CONTEXT,
  devtool: env.IS_PROD ? 'eval-source-map' : 'source-map',
  mode: env.IS_PROD ? 'production' : 'development',
  module: {
    rules: [tsLoader, vueLoader, iconsLoader],
  },
  plugins: [definePlugin, vuePlugin],
  resolve: {
    extensions: ['.ts', '.js'],
    tsConfig: './tsconfig.json',
  },
  stats: {
    colors: true,
    preset: 'minimal',
  },
});
