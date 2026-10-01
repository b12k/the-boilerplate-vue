import type { AxiosError } from 'axios';
import type { NextFunction, Request, Response } from 'express';

import { env } from '@server/env';
import { stringify } from 'safe-stable-stringify';

import { getContext } from './context.middleware';

function errorMiddleware(
  error: AxiosError | Error,
  request: Request,
  response: Response,
  _next: NextFunction,
) {
  const context = getContext();

  if (context.isDebug) {
    response.status(500).render('debug', {
      details: stringify({
        context,
        env,
        error: error.stack?.split('\n').map((line) => line.trim()),
        request,
      }),
      message: error.message,
    });
    return;
  }

  response.status(500).render('500');
}

export { errorMiddleware };
