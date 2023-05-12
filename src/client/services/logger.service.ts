import pino, { Logger } from 'pino';

// eslint-disable-next-line import/no-mutable-exports
export let logger = pino();

export const replaceLogger = (_logger: Logger) => {
  logger = _logger;
};
