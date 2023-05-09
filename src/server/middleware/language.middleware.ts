import { RequestHandler } from 'express';
import { getLanguage, acceptedLanguages } from '../utils';

export const languageMiddleware: RequestHandler = (request, response, next) => {
  const { params } = request;

  if (acceptedLanguages.includes(params.lang)) {
    response.cookie('lang', params.lang, {
      sameSite: 'lax',
      secure: true,
    });
  } else if (!params.lang) {
    return response.redirect(302, `/${getLanguage(request)}`);
  }

  return next();
};
