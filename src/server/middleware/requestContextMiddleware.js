const {
  env: {
    NODE_ENV,
    SERVER_ENV,
    DEFAULT_LANGUAGE,
    ACCEPTED_LANGUAGES,
  },
} = process;

export default () => (req, res, next) => {
  const {
    params,
    cookies,
    originalUrl,
  } = req;
  const acceptedLanguages = ACCEPTED_LANGUAGES.split('|');
  const lang = acceptedLanguages.includes(params.lang)
    ? params.lang
    : cookies.lang
      || req.acceptsLanguages(acceptedLanguages)
      || DEFAULT_LANGUAGE;

  if (cookies.lang !== lang) {
    res.cookie('lang', lang);
  }

  req.context = {
    lang,
    acceptedLanguages,
    url: originalUrl,
    env: {
      NODE_ENV,
      SERVER_ENV,
      DEFAULT_LANGUAGE,
      ACCEPTED_LANGUAGES,
    },
  };

  return params.lang
    ? next()
    : res.redirect(302, `/${lang}`);
};
