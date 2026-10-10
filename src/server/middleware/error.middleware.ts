import type { AxiosError } from 'axios';
import type { NextFunction, Request, Response } from 'express';

import { env } from '@server/env';
import { SsrResponseTimeoutError } from '@server/utils';
import { stringify } from 'safe-stable-stringify';

import { getOptionalContext } from './context.middleware';
import { setHtmlSecurityHeaders } from './helmet.middleware';

const MIN_ERROR_STATUS = 400;
const MAX_ERROR_STATUS = 599;

export function errorMiddleware(
  error: AxiosError | Error,
  request: Request,
  response: Response,
  next: NextFunction,
) {
  if (error instanceof SsrResponseTimeoutError) {
    request.log.error(
      {
        budgetMs: error.budgetMs,
        code: error.code,
        elapsedMs: error.elapsedMs,
        err: error,
        requestId: request.requestId,
        route: request.originalUrl,
      },
      error.message,
    );
  } else {
    request.log.error(error);
  }
  if (response.headersSent) {
    next(error);
    return;
  }

  response.setHeader('Cache-Control', 'no-store');
  setHtmlSecurityHeaders(request, response);
  const context = getOptionalContext();
  const status = 'status' in error ? error.status : undefined;
  const statusCode = 'statusCode' in error ? error.statusCode : undefined;
  const responseCode =
    [status, statusCode].find(
      (code): code is number =>
        typeof code === 'number' &&
        Number.isInteger(code) &&
        code >= MIN_ERROR_STATUS &&
        code <= MAX_ERROR_STATUS,
    ) ?? 500;

  if (context?.isDebug) {
    response.status(responseCode).render('debug', {
      details: stringify({
        context,
        env,
        error: error.stack?.split('\n').map((line) => line.trim()),
        request,
      })?.replaceAll('<', String.raw`\u003C`),
      message: error.message,
      nonce: request.nonce,
    });
    return;
  }

  response.status(responseCode).render('500');
}
