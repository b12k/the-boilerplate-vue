import type { IdempotencyConfig } from './services';

export const idempotencyConfig: IdempotencyConfig = {
  beforeCompute: (context) => context.device.type,
  paths: {
    '/:lang': (_context, parameters) => parameters['lang'],
    '/:lang/:page': (_context, parameters) =>
      [parameters['lang'], parameters['page']].join(':'),
  },
};
