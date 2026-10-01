import type { RequestHandler } from 'express';
import type { HelmetOptions } from 'helmet';

import helmet from 'helmet';

function helmetMiddleware(isEnabled: boolean) {
  return ((request, response, next) => {
    if (!isEnabled) {
      next();
      return;
    }

    const { requestId } = request;

    const options: HelmetOptions = {
      contentSecurityPolicy: {
        directives: {
          childSrc: ["'self'"],
          connectSrc: [
            "'self'",
            'https://gateway.umami.is',
            'https://eu.umami.is',
            'https://api-gateway-eu.umami.dev',
            'https://api-gateway.umami.dev',
          ],
          imgSrc: [
            "'self'",
            'data:',
            'https://picsum.photos',
            'https://fastly.picsum.photos',
          ],
          scriptSrc: [
            "'self'",
            `'nonce-${requestId}'`,
            "'unsafe-eval'",
            'https://cloud.umami.is',
          ],
          workerSrc: ["'self'"],
        },
      },
    };

    helmet(options)(request, response, next);
  }) satisfies RequestHandler;
}

export { helmetMiddleware };
