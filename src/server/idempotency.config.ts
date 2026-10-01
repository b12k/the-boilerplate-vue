import type { IdempotencyConfig } from './services';

const idempotencyConfig: IdempotencyConfig = {
  beforeCompute: (context) => context.device.type,
  paths: {
    '/:lang': (_context, parameters) => parameters['lang'],
  },
};

export { idempotencyConfig };
