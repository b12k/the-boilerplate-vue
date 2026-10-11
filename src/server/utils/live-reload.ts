import type { NextFunction, Request, Response } from 'express';

import { env } from '@server/env';

export function liveReload(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const isLiveReloadOn = !env.IS_PROD && Boolean(env.LIVE_RELOAD_PATH);
  const isLiveReloadRequest =
    request.method === 'GET' && request.path === `/${env.LIVE_RELOAD_PATH}`;

  if (!isLiveReloadOn || !isLiveReloadRequest) {
    next();
    return;
  }

  response.setHeader('Content-Type', 'text/event-stream');
  response.setHeader('Connection', 'keep-alive');
  response.setHeader('Cache-Control', 'no-cache');

  response.write('data:\n\n');

  request.on('close', () => response.end());
}
