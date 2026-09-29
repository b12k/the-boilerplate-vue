import type { IdempotencyConfig } from './services';

export default {
  beforeCompute: (context) => context.device.type,
  paths: {
    '/:lang': (_context, parameters) => parameters['lang'],
  },
} as IdempotencyConfig;
