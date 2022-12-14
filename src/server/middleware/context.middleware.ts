import { AsyncLocalStorage } from 'node:async_hooks';
import { RequestHandler } from 'express';

import { buildContext, Context } from '../services';

const contextStorage = new AsyncLocalStorage<Context>();
export const getContext = () => {
  const context = contextStorage.getStore();
  if (!context) throw new Error('Missing request context');

  return context;
};
export const contextMiddleware: RequestHandler = (request, response, next) => {
  try {
    return contextStorage.run(buildContext(request), () => next());
  } catch (error) {
    return next(error);
  }
};
