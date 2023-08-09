import pino from 'pino';

// eslint-disable-next-line import/no-mutable-exports
export let logger = pino();

export type Logger = typeof logger;

export const replaceLogger = (_logger: Logger) => {
  logger = _logger;
};
