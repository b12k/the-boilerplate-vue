import { RequestHandler } from 'express';

export const cspHeadersMiddleware: RequestHandler = (
  request,
  response,
  next,
) => {
  response.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'none'",
      "script-src 'self'",
      "connect-src 'self'",
      "img-src 'self'",
      "style-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join(';'),
  );
  return next();
};
