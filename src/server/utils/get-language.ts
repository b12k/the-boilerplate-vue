import type { Request } from 'express';

import { env } from '../env';

export const acceptedLanguages = env.ACCEPTED_LANGUAGES.split(',').map((l) =>
  l.trim(),
);

export const getLanguage = (request: Request) => {
  const { cookies, params } = request;
  const lang = params['lang'];
  const cookieLang = cookies['lang'];

  return ((lang && acceptedLanguages.includes(lang) && lang) ||
    (cookieLang && acceptedLanguages.includes(cookieLang) && cookieLang) ||
    request.acceptsLanguages(acceptedLanguages) ||
    env.DEFAULT_LANGUAGE) as string;
};
