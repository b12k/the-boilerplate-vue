export default () => {
  const {
    env: {
      DEFAULT_LANGUAGE,
      ACCEPTED_LANGUAGES,
    },
  } = process;

  const acceptedLanguages = ACCEPTED_LANGUAGES.split('|');

  return (req, res) => {
    const {
      cookies: {
        lang: cookieLang,
      },
    } = req;

    const defaultLanguage = cookieLang
      || req.acceptsLanguages(acceptedLanguages)
      || DEFAULT_LANGUAGE;

    return res
      .cookie('lang', defaultLanguage)
      .redirect(302, `/${defaultLanguage}`);
  };
};
