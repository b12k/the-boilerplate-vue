import { RequestHandler } from 'express';

export const cspHeadersMiddleware: RequestHandler = (
  request,
  response,
  next,
) => {
  response.setHeader('Content-Security-Policy', "default-src 'self'");
  return next();
};
