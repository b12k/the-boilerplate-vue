import type { Request } from 'express';

import { env } from '../env';

export const acceptedLanguages = env.ACCEPTED_LANGUAGES.split(',').map((l) =>
  l.trim(),
);

export const getLanguage = (request: Request) => {
  const { cookies, params } = request;

  return ((acceptedLanguages.includes(params.lang) && params.lang) ||
    (acceptedLanguages.includes(cookies.lang as string) && cookies.lang) ||
    request.acceptsLanguages(acceptedLanguages) ||
    env.DEFAULT_LANGUAGE) as string;
};
