import type { IdempotencyConfig } from './services';

export default {
  beforeCompute: (context) => context.device.type,
  paths: {
    '/:lang': (context, params) => params.lang,
  },
} as IdempotencyConfig;
