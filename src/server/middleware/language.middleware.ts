import type { NextFunction, Request, Response } from 'express';

import { env } from '@server/env';
import { acceptedLanguages, getLanguage } from '@server/utils';

// Keep the selected language for 100 days.
const LANGUAGE_COOKIE_TTL_MS = 8_640_000_000;

function languageMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const { params } = request;
  const { lang } = params;

  if (!lang) {
    response.redirect(302, `/${getLanguage(request)}`);
    return;
  }

  if (acceptedLanguages.includes(lang)) {
    response.cookie('lang', lang, {
      maxAge: LANGUAGE_COOKIE_TTL_MS,
      sameSite: 'lax',
      secure: env.IS_PROD,
    });
  }

  next();
}

export { languageMiddleware };
