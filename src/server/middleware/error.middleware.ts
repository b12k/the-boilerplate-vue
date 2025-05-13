import type { AxiosError } from 'axios';

import { type ErrorRequestHandler } from 'express';
import { stringify } from 'safe-stable-stringify';

import { env } from '../env';
import { getContext } from './context.middleware';

export const errorMiddleware: ErrorRequestHandler = (
  error: AxiosError | Error,
  request,
  response,
  next,
) => {
  if (!error) return next();

  const context = getContext();

  if (context.isDebug) {
    return response.status(500).render('debug', {
      details: stringify({
        context,
        env,
        error: error.stack?.split('\n').map((line) => line.trim()),
        request,
      }),
      message: error.message,
    });
  }

  return response.status(500).render('500');
};
