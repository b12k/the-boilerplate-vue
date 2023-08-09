import { ErrorRequestHandler } from 'express';
import serialize from 'serialize-javascript';

import type { AxiosError } from 'axios';
import { getContext } from './context.middleware';
import { env } from '../env';

export const errorMiddleware: ErrorRequestHandler = (
  error: Error | AxiosError,
  request,
  response,
  next,
) => {
  if (!error) return next();

  const context = getContext();

  if (context.isDebug) {
    return response.status(500).render('debug', {
      message: error.message,
      details: serialize({
        error: error.stack?.split('\n').map((line) => line.trim()),
        env,
        request,
        context,
      }),
    });
  }

  return response.status(500).render('500');
};
