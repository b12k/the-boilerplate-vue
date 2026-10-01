import type { Logger } from 'pino';

function createApi(logger: Logger) {
  return {
    get: () => logger.info('👌'),
  };
}

export { createApi };
