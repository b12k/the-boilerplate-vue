import type { IdempotencyConfig } from './services';

export default {
  beforeCompute: (context) => context.isMobile,
  paths: {
    '/:lang': (context, params) => params.lang,
  },
} as IdempotencyConfig;
