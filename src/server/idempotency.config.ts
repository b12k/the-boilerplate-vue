import type { IdempotencyConfig } from './services';

export default {
  paths: {
    '/:lang': (params) => [params.lang, 'home-page'].join('-'),
    '/:lang/two': (params) => [params.lang, 'page-two'].join('-'),
  },
} as IdempotencyConfig;
