import { type RequestHandler } from 'express';

import { acceptedLanguages, getLanguage } from '../utils';

export const languageMiddleware: RequestHandler = (request, response, next) => {
  const { params } = request;
  const lang = params['lang'];

  const expires = new Date();
  expires.setDate(expires.getDate() + 100);

  if (lang && acceptedLanguages.includes(lang)) {
    response.cookie('lang', lang, {
      expires,
      sameSite: 'lax',
      secure: true,
    });
  } else if (!lang) {
    return response.redirect(302, `/${getLanguage(request)}`);
  }

  return next();
};
