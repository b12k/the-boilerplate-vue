import jsonStringifySafe from 'json-stringify-safe';

export default () => {
  const stringify = (thing) => jsonStringifySafe(thing, null, 2);

  return (err, req, res, next) => {
    if (!err) return next();

    return res.status(500).render('500', {
      err,
      req: stringify(req),
    });
  };
};
