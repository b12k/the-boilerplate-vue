import type { Request, Response } from 'express';

const startedAt = Date.now();

export function healthMiddleware(_: Request, response: Response) {
  response.send({
    status: 'OK',
    uptime: Date.now() - startedAt,
  });
}
