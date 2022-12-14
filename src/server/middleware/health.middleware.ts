import { RequestHandler } from 'express';

const startedAt = Date.now();

export const healthMiddleware: RequestHandler = (request, response) =>
  response.json({
    status: 'OK',
    uptime: Date.now() - startedAt,
  });
