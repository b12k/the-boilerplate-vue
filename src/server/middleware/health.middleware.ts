import { type RequestHandler } from 'express';

const startedAt = Date.now();

export const healthMiddleware: RequestHandler = (_, response) => {
  response.send({
    status: 'OK',
    uptime: Date.now() - startedAt,
  });
};
