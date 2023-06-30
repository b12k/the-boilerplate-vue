import { RequestHandler } from 'express';
import helmet, { HelmetOptions } from 'helmet';

import { getContext } from './context.middleware';

export const helmetMiddleware =
  (isEnabled: boolean): RequestHandler =>
  (request, response, next) => {
    if (!isEnabled) return next();

    const { requestId } = getContext();

    const options: HelmetOptions = {
      contentSecurityPolicy: {
        directives: {
          scriptSrc: ["'self'", `'nonce-${requestId}'`, "'unsafe-inline'"],
        },
      },
    };

    return helmet(options)(request, response, next);
  };
