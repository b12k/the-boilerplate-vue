import type { NextFunction, Request, Response } from 'express';

import { getContext } from './context.middleware';

export function sourceMapsMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  let pathname = request.path;
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    response.sendStatus(404);
    return;
  }

  if (pathname.toLowerCase().includes('.map')) {
    if (!getContext().canServeSourceMaps) {
      response.sendStatus(404);
      return;
    }
    response.setHeader('Cache-Control', 'private, no-store');
  }

  next();
}
