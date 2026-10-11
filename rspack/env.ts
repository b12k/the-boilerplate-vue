import path from 'node:path';
import { z } from 'zod';

/* oxlint-disable node/no-process-env -- Rspack environment variables are read and validated only in this module. */

const configDirname = import.meta.dirname;
const flagSchema = z.stringbool().default(false);
const envSchema = z.object({
  BUNDLER_CACHE: flagSchema,
  NODE_ENV: z.string().trim().min(1).default('production'),
  STATS_ENABLED: flagSchema,
  WDS_PORT: z.coerce.number().optional(),
});
const envParseResult = envSchema.safeParse(process.env);
if (!envParseResult.success) {
  throw new Error(z.prettifyError(envParseResult.error));
}
const { NODE_ENV, ...envVariables } = envParseResult.data;

const ICONS_FOLDER_PATH = path.resolve(
  configDirname,
  '../src/app/assets/icons',
);
const IS_PROD = NODE_ENV !== 'development';
const CONTEXT = path.resolve(configDirname, '..');
const OUTPUT_PATH = path.resolve(configDirname, '../dist');
const OUTPUT_PUBLIC_PATH = IS_PROD
  ? '/'
  : `http://localhost:${envVariables.WDS_PORT}/`;

export const env = {
  ...envVariables,
  CONTEXT,
  ICONS_FOLDER_PATH,
  IS_PROD,
  OUTPUT_PATH,
  OUTPUT_PUBLIC_PATH,
};
