import type { Request } from 'express';

import { env } from '@server/env';

const acceptedLanguages = env.ACCEPTED_LANGUAGES;

function getLanguage(request: Request) {
  const { cookies, params } = request;
  const { lang } = params;
  const cookieLang: unknown = cookies['lang'];
  const candidates: Array<unknown> = [
    lang,
    cookieLang,
    request.acceptsLanguages(acceptedLanguages),
  ];
  return (
    candidates.find(
      (candidate): candidate is string =>
        typeof candidate === 'string' && acceptedLanguages.includes(candidate),
    ) ?? env.DEFAULT_LANGUAGE
  );
}

export { acceptedLanguages, getLanguage };
