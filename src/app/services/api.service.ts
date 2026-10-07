import type { Logger } from 'pino';

export function createApi(logger: Logger) {
  return {
    get: () => logger.info('👌'),
  };
}
