import { z } from 'zod';

import { envDefaults } from './env-defaults';

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
    API_URL: z.url({ protocol: /^https?$/u }),
    CACHE_CRITICAL_CSS: z.stringbool().default(envDefaults.CACHE_CRITICAL_CSS),
    CACHE_CRITICAL_CSS_BUDGET_MS: positiveNumberSchema.default(
      envDefaults.CACHE_CRITICAL_CSS_BUDGET_MS,
    ),
    CACHE_CRITICAL_CSS_MAX_HTML_BYTES: positiveNumberSchema.default(
      envDefaults.CACHE_CRITICAL_CSS_MAX_HTML_BYTES,
    ),
    CACHE_CRITICAL_CSS_MAX_QUEUE: z.coerce
      .number()
      .int()
      .min(0)
      .default(envDefaults.CACHE_CRITICAL_CSS_MAX_QUEUE),
    CACHE_CRITICAL_CSS_MAX_THREADS: positiveNumberSchema.default(
      envDefaults.CACHE_CRITICAL_CSS_MAX_THREADS,
    ),
    CACHE_CRITICAL_CSS_TTL_SEC: positiveNumberSchema.default(
      envDefaults.CACHE_CRITICAL_CSS_TTL_SEC,
    ),
    CACHE_RENDER: z.stringbool().default(envDefaults.CACHE_RENDER),
    CACHE_RENDER_TTL_SEC: positiveNumberSchema.default(
      envDefaults.CACHE_RENDER_TTL_SEC,
    ),
    DEBUG_ON_KEY: z.uuid().optional(),
    DEFAULT_LANGUAGE: languageSchema,
    LIVE_RELOAD_PATH: nonEmptyStringSchema.optional(),
    LOG_LEVEL: logLevelSchema.default(envDefaults.LOG_LEVEL),
    NODE_ENV: nonEmptyStringSchema.default(envDefaults.NODE_ENV),
    PORT: positiveNumberSchema.default(envDefaults.PORT),
    REDIS_CONNECTION_RETRIES: z.coerce
      .number()
      .int()
      .min(0)
      .default(envDefaults.REDIS_CONNECTION_RETRIES),
    REDIS_HOST: nonEmptyStringSchema,
    REDIS_PASSWORD: z.string(),
    REDIS_PORT: positiveNumberSchema,
    REDIS_READ_TIMEOUT_MS: positiveNumberSchema.default(
      envDefaults.REDIS_READ_TIMEOUT_MS,
    ),
    SERVE_SOURCE_MAPS: z.stringbool().default(envDefaults.SERVE_SOURCE_MAPS),
    SHUTDOWN_BUDGET_MS: positiveNumberSchema.default(
      envDefaults.SHUTDOWN_BUDGET_MS,
    ),
    SSR_RESPONSE_BUDGET_MS: positiveNumberSchema.default(
      envDefaults.SSR_RESPONSE_BUDGET_MS,
    ),
  })
  .refine(
    ({ ACCEPTED_LANGUAGES, DEFAULT_LANGUAGE }) =>
      ACCEPTED_LANGUAGES.includes(DEFAULT_LANGUAGE),
    {
      message: 'DEFAULT_LANGUAGE must be included in ACCEPTED_LANGUAGES',
      path: ['DEFAULT_LANGUAGE'],
    },
  );
