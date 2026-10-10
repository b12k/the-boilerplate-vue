import type { NextFunction, Request, Response } from 'express';

import { env } from '@server/env';
import { acceptedLanguages, getLanguage } from '@server/utils';

import { setHtmlSecurityHeaders } from './helmet.middleware';

// Keep the selected language for 100 days.
const LANGUAGE_COOKIE_TTL_MS = 8_640_000_000;

export function languageMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const { params } = request;
  const { lang } = params;

  if (!lang) {
    setHtmlSecurityHeaders(request, response);
    response.redirect(302, `/${getLanguage(request)}`);
    return;
  }

  if (typeof lang === 'string' && acceptedLanguages.includes(lang)) {
    response.cookie('lang', lang, {
      maxAge: LANGUAGE_COOKIE_TTL_MS,
      sameSite: 'lax',
      secure: env.IS_PROD,
    });
  }

  next();
}
