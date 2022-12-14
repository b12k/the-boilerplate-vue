import type { IdempotencyConfig } from './services';

export default {
  paths: {
    '/:lang': (params) => [params.lang, 'home-page'].join('-'),
  },
} as IdempotencyConfig;
