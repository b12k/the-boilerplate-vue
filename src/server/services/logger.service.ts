import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';

export const loggerService = pinoHttp({
  genReqId: (request, response) => {
    const requestId = request.headers['X-Request-Id'] || randomUUID();
    response.setHeader('X-Request-Id', requestId);
    return requestId;
  },
});
