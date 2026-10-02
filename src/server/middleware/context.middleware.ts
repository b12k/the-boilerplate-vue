import type { Context } from '@server/services';
import type { NextFunction, Request, Response } from 'express';

import { buildContext } from '@server/services';
import { AsyncLocalStorage } from 'node:async_hooks';

const contextStorage = new AsyncLocalStorage<Context>();
function contextMiddleware(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  contextStorage.run(buildContext(request), next);
}
function getContext() {
  const context = contextStorage.getStore();
  if (context) return context;
  throw new Error('Missing request context');
}

export { contextMiddleware, getContext };
