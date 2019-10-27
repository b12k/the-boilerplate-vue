import jsonStringifySafe from 'json-stringify-safe';

const { env } = process;

export default () => (err, req, res, next) => {
  if (!err) return next();

  const { cookies } = req;
  const canShowDetailedErrors = env.SHOW_DETAILED_ERRORS === 'true' || cookies.SHOW_DETAILED_ERRORS === 'true';

  let template = 'serverError';
  let data = {
    title: 'Server Error',
    lang: req.context.lang,
  };

  if (canShowDetailedErrors) {
    template = 'serverErrorDetailed';
    data = {
      ...data,
      err,
      req: jsonStringifySafe(req, null, 2),
    };
  }

  return res
    .status(500)
    .render(template, data);
};
