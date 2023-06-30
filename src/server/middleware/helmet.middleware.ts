import { RequestHandler } from 'express';
import helmet, { HelmetOptions } from 'helmet';

import { getContext } from './context.middleware';

export const helmetMiddleware: RequestHandler = (request, response, next) => {
  const { requestId } = getContext();

  const options: HelmetOptions = {
    contentSecurityPolicy: {
      directives: {
        scriptSrc: ["'self'", `'nonce-${requestId}'`, "'unsafe-inline'"],
      },
    },
  };

  helmet(options)(request, response, next);
};
