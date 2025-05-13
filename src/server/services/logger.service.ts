import type { Request, Response } from 'express';

import { randomUUID } from 'node:crypto';
import { pinoHttp } from 'pino-http';
import pinoPretty from 'pino-pretty';

import { env } from '../env';

const pinoPrettyStream = pinoPretty({
  colorize: true,
});

const config = {
  genReqId: (request: Request, response: Response) => {
    const requestId = request.headers['X-Request-Id'] || randomUUID();
    response.setHeader('X-Request-Id', requestId);
    return requestId;
  },
  level: env.LOG_LEVEL || 'silent',
};

export const loggerService = pinoHttp(config, pinoPrettyStream);
