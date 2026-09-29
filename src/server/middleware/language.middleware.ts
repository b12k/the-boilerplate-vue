import { type RequestHandler } from 'express';

import { acceptedLanguages, getLanguage } from '../utils';

export const languageMiddleware: RequestHandler = (request, response, next) => {
  const { params } = request;
  const lang = params['lang'];

  if (lang && acceptedLanguages.includes(lang)) {
    response.cookie('lang', lang, {
      maxAge: 100 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      secure: true,
    });
  } else if (!lang) {
    return response.redirect(302, `/${getLanguage(request)}`);
  }

  return next();
};
