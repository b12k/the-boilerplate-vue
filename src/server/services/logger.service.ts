import type { Request, Response } from 'express';

import { env } from '@server/env';
import { randomUUID } from 'node:crypto';
import { pinoHttp } from 'pino-http';
import pinoPretty from 'pino-pretty';

const stream = env.IS_PROD ? undefined : pinoPretty({ colorize: true });

const config = {
  genReqId: (request: Request, response: Response) => {
    const header = request.headers['x-request-id'];
    const requestId =
      typeof header === 'string' && header.length > 0 ? header : randomUUID();
    request.requestId = requestId;
    response.setHeader('X-Request-ID', requestId);
    return requestId;
  },
  level: env.LOG_LEVEL,
};

export const loggerService = pinoHttp(config, stream);
