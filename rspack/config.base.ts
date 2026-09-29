import { defineConfig } from '@rspack/cli';

import env from './env';
import { iconsLoader, tsLoader, vueLoader } from './loaders';
import { definePlugin, vuePlugin } from './plugins';

export default defineConfig({
  context: env.CONTEXT,
  devtool: env.IS_PROD ? 'source-map' : 'eval-source-map',
  mode: env.IS_PROD ? 'production' : 'development',
  module: {
    rules: [tsLoader, vueLoader, iconsLoader],
  },
  output: {
    path: env.OUTPUT_PATH,
  },
  plugins: [definePlugin, vuePlugin],
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    tsConfig: './tsconfig.json',
  },
  stats: {
    colors: true,
    preset: 'minimal',
  },
});
