export default () => {
  const {
    env: {
      NODE_ENV,
      SERVER_ENV,
      DEFAULT_LANGUAGE,
      ACCEPTED_LANGUAGES,
    },
  } = process;

  return (req, res, next) => {
    const {
      params: {
        lang,
      },
      originalUrl,
    } = req;

    req.context = {
      isSSR: true,
      lang,
      url: originalUrl,
      env: {
        NODE_ENV,
        SERVER_ENV,
        DEFAULT_LANGUAGE,
        ACCEPTED_LANGUAGES,
      },
    };

    return next();
  };
};
