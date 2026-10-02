import { z } from 'zod';

const DAY_SEC = 86_400;
const MAX_PORT = 65_535;

const cacheTtlSecSchema = z.coerce.number().int().positive().default(DAY_SEC);
const flagSchema = z
  .stringbool({ case: 'sensitive', falsy: ['false'], truthy: ['true'] })
  .default(false);
const languageSchema = z
  .string()
  .trim()
  .min(1)
  .refine((lang) => {
    try {
      Intl.getCanonicalLocales(lang);
      return true;
    } catch {
      return false;
    }
  }, 'Expected a valid language tag');
const nonEmptyStringSchema = z.string().trim().min(1);
const portSchema = z.coerce.number().int().min(1).max(MAX_PORT);
const redisUrlSchema = z
  .url({ hostname: /^.+$/u, protocol: /^rediss?$/u })
  .pipe(
    z.string().refine((redisUrl) => {
      const { pathname, port } = new URL(redisUrl);
      return (
        (!port || portSchema.safeParse(port).success) &&
        /^(?:\/\d*)?$/u.test(pathname)
      );
    }, 'Expected a Redis URL with a valid port and an optional integer database'),
  );
const logLevelSchema = z
  .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
  .default('info');
const nodeEnvSchema = z.enum(['development', 'production', 'test']);
const acceptedLanguagesSchema = z
  .string()
  .transform((languages) => languages.split(',').map((lang) => lang.trim()))
  .pipe(z.array(languageSchema).min(1));
const envSchema = z
  .object({
    ACCEPTED_LANGUAGES: acceptedLanguagesSchema,
    CRITICAL_CSS_CACHE_SALT: nonEmptyStringSchema.optional(),
    CRITICAL_CSS_CACHE_TTL_SEC: cacheTtlSecSchema,
    DEBUG_ON_KEY: z.uuid().optional(),
    DEFAULT_LANGUAGE: languageSchema,
    IS_CACHE_ON: flagSchema,
    IS_CRITICAL_CSS_CACHE_ON: flagSchema,
    IS_DEBUG_ON: flagSchema,
    IS_RENDER_CACHE_ON: flagSchema,
    LIVE_RELOAD_PATH: nonEmptyStringSchema.optional(),
    LOG_LEVEL: logLevelSchema,
    NODE_ENV: nodeEnvSchema,
    npm_package_version: nonEmptyStringSchema,
    PORT: portSchema,
    REDIS_URL: redisUrlSchema.optional(),
    RENDER_CACHE_SALT: nonEmptyStringSchema.optional(),
    RENDER_CACHE_TTL_SEC: cacheTtlSecSchema,
  })
  .refine(
    ({ ACCEPTED_LANGUAGES, DEFAULT_LANGUAGE }) =>
      ACCEPTED_LANGUAGES.includes(DEFAULT_LANGUAGE),
    {
      message: 'DEFAULT_LANGUAGE must be included in ACCEPTED_LANGUAGES',
      path: ['DEFAULT_LANGUAGE'],
    },
  );

export { envSchema };
