import type { RequestHandler } from 'express';

import { env } from '@server/env';

function liveReload(liveReloadPath = '') {
  return ((request, response, next) => {
    const isLiveReload =
      liveReloadPath.length > 0 &&
      request.method === 'GET' &&
      request.path === `/${liveReloadPath}`;

    if (!env.IS_PROD || !isLiveReload) {
      next();
      return;
    }

    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('Cache-Control', 'no-cache');

    response.write('data:\n\n');

    request.on('close', () => response.end());
  }) satisfies RequestHandler;
}

export { liveReload };
