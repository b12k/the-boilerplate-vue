import pino, { Logger } from 'pino';

let logger: Logger | undefined;
export const createLogger = (serverLogger?: Logger) => {
  logger = serverLogger || pino();
};

export const getLogger = () => {
  if (!logger) throw new Error('Logger is used before created');
  return logger;
};
