import type { IdempotencyConfig } from './services';

export default {
  paths: {
    '/:lang': (context, params) => [params.lang, 'home-page'].join('-'),
    '/:lang/two': (context, params) => [params.lang, 'page-two'].join('-'),
  },
} as IdempotencyConfig;
