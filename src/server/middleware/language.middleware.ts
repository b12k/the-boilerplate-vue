import { type RequestHandler } from 'express';

import { acceptedLanguages, getLanguage } from '../utils';

export const languageMiddleware: RequestHandler = (request, response, next) => {
  const { params } = request;

  const expires = new Date();
  expires.setDate(expires.getDate() + 100);

  if (acceptedLanguages.includes(params.lang)) {
    response.cookie('lang', params.lang, {
      expires,
      sameSite: 'lax',
      secure: true,
    });
  } else if (!params.lang) {
    return response.redirect(302, `/${getLanguage(request)}`);
  }

  return next();
};
