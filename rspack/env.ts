import path from 'node:path';
import { z } from 'zod';

/* oxlint-disable node/no-process-env -- Rspack environment variables are read and validated only in this module. */

const configDirname = import.meta.dirname;
const MAX_PORT = 65_535;
const flagSchema = z
  .stringbool({ case: 'sensitive', falsy: ['false'], truthy: ['true'] })
  .default(false);
const portSchema = z.coerce.number().int().min(1).max(MAX_PORT);
const developmentSchema = z.object({ WDS_PORT: portSchema });
const envSchema = z
  .object({
    IS_BUNDLER_CACHE_ON: flagSchema,
    IS_STATS_ENABLED: flagSchema,
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('production'),
    WDS_PORT: portSchema.optional(),
  })
  .transform(({ NODE_ENV, ...variables }) => {
    if (NODE_ENV !== 'development') {
      return { ...variables, IS_PROD: true as const };
    }
    return {
      ...variables,
      ...developmentSchema.parse(variables),
      IS_PROD: false as const,
    };
  });
const variables = envSchema.parse(process.env);

const ICONS_FOLDER_PATH = path.resolve(
  configDirname,
  '../src/app/assets/icons',
);
const CONTEXT = path.resolve(configDirname, '..');
const OUTPUT_PATH = path.resolve(configDirname, '../dist');
const OUTPUT_PUBLIC_PATH = variables.IS_PROD
  ? '/'
  : `http://localhost:${variables.WDS_PORT}/`;

const env = {
  ...variables,
  CONTEXT,
  ICONS_FOLDER_PATH,
  OUTPUT_PATH,
  OUTPUT_PUBLIC_PATH,
};

export { env };
