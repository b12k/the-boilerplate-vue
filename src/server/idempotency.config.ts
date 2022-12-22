import type { IdempotencyConfig } from './services';

export default {
  paths: {
    '/:lang': (context, params) => params.lang,
  },
} as IdempotencyConfig;
