import { z } from 'zod';

// One day
const CACHE_TTL_SEC = 86_400;
const DEFAULT_CRITICAL_CSS_BUDGET_SEC = 10;
const DEFAULT_REDIS_CONNECTION_RETRIES = 5;
const DEFAULT_REDIS_READ_TIMEOUT_MS = 1000;
const LANG_CHARS_COUNT = 2;

const languageSchema = z.string().trim().length(LANG_CHARS_COUNT);
const nonEmptyStringSchema = z.string().trim().min(1);
const positiveNumberSchema = z.coerce.number().int().min(1);
const logLevelSchema = z.enum([
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'silent',
]);
const acceptedLanguagesSchema = z
  .string()
  .transform((languages) => languages.split(',').map((lang) => lang.trim()))
  .pipe(z.array(languageSchema).min(1));
export const envSchema = z
  .object({
    ACCEPTED_LANGUAGES: acceptedLanguagesSchema,
    CACHE_CRITICAL_CSS: z.stringbool().default(false),
    CACHE_CRITICAL_CSS_BUDGET_SEC: positiveNumberSchema.default(
      DEFAULT_CRITICAL_CSS_BUDGET_SEC,
    ),
    CACHE_CRITICAL_CSS_TTL_SEC: positiveNumberSchema.default(CACHE_TTL_SEC),
    CACHE_RENDER: z.stringbool().default(false),
    CACHE_RENDER_TTL_SEC: positiveNumberSchema.default(CACHE_TTL_SEC),
    DEBUG: z.stringbool().default(false),
    DEBUG_ON_KEY: z.uuid().optional(),
    DEFAULT_LANGUAGE: languageSchema,
    LIVE_RELOAD_PATH: nonEmptyStringSchema.optional(),
    LOG_LEVEL: logLevelSchema.default('info'),
    NODE_ENV: nonEmptyStringSchema,
    PORT: positiveNumberSchema,
    REDIS_CONNECTION_RETRIES: z.coerce
      .number()
      .int()
      .min(0)
      .default(DEFAULT_REDIS_CONNECTION_RETRIES),
    REDIS_HOST: nonEmptyStringSchema,
    REDIS_PASSWORD: z.string(),
    REDIS_PORT: positiveNumberSchema,
    REDIS_READ_TIMEOUT_MS: positiveNumberSchema.default(
      DEFAULT_REDIS_READ_TIMEOUT_MS,
    ),
    SERVE_SOURCE_MAPS: z.stringbool().default(false),
  })
  .refine(
    ({ ACCEPTED_LANGUAGES, DEFAULT_LANGUAGE }) =>
      ACCEPTED_LANGUAGES.includes(DEFAULT_LANGUAGE),
    {
      message: 'DEFAULT_LANGUAGE must be included in ACCEPTED_LANGUAGES',
      path: ['DEFAULT_LANGUAGE'],
    },
  );
