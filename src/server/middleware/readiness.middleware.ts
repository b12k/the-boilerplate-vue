import type { NextFunction, Request, Response } from 'express';

import { serverReadiness } from '@server/utils';

import { healthMiddleware } from './health.middleware';

export function readinessMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  if (!serverReadiness.isReady) {
    healthMiddleware(request, response);
    return;
  }
  next();
}
