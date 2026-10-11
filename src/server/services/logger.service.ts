import type { Request, Response } from 'express';

import { env } from '@server/env';
import { createLogRedactor } from '@server/utils';
import { randomUUID } from 'node:crypto';
import { pinoHttp } from 'pino-http';
import pinoPretty from 'pino-pretty';

const prettyLogStream = env.IS_PROD
  ? undefined
  : pinoPretty({ colorize: true });

const httpLoggerOptions = {
  genReqId: (request: Request, response: Response) => {
    const requestIdHeader = request.headers['x-request-id'];
    const requestId =
      typeof requestIdHeader === 'string' && requestIdHeader.length > 0
        ? requestIdHeader
        : randomUUID();
    request.requestId = requestId;
    response.setHeader('X-Request-ID', requestId);
    return requestId;
  },
  hooks: {
    streamWrite: createLogRedactor({
      secrets: [env.REDIS_PASSWORD, env.DEBUG_ON_KEY],
      urls: [env.API_URL, env.REDIS_URL],
    }),
  },
  level: env.LOG_LEVEL,
};

export const loggerService = pinoHttp(httpLoggerOptions, prettyLogStream);
