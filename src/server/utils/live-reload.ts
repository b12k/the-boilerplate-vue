import type { NextFunction, Request, Response } from 'express';

export const liveReload =
  (liveReloadPath?: string) =>
  (request: Request, response: Response, next: NextFunction) => {
    const isLiveReload =
      liveReloadPath &&
      request.method === 'GET' &&
      request.path === `/${liveReloadPath}`;

    if (!isLiveReload) return next();

    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('Cache-Control', 'no-cache');

    response.write('data:\n\n');

    request.on('close', () => response.end());
  };
