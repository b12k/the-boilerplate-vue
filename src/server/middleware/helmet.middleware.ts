import type { NextFunction, Request, Response } from 'express';
import type { HelmetOptions } from 'helmet';

import { env } from '@server/env';
import helmet from 'helmet';
import { randomUUID } from 'node:crypto';

export function helmetMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  request.nonce = randomUUID();
  const developmentSources = env.IS_PROD
    ? []
    : [
        'http://localhost:*',
        'http://127.0.0.1:*',
        'ws://localhost:*',
        'ws://127.0.0.1:*',
      ];
  const options: HelmetOptions = {
    contentSecurityPolicy: {
      directives: {
        childSrc: ["'self'"],
        connectSrc: [
          "'self'",
          ...developmentSources,
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
          `'nonce-${request.nonce}'`,
          ...developmentSources,
          // Rspack's development eval-source-map executes modules through eval().
          ...(env.IS_PROD ? [] : ["'unsafe-eval'"]),
          'https://cloud.umami.is',
        ],
        // oxlint-disable-next-line unicorn/no-null -- Helmet requires null to remove this default directive.
        upgradeInsecureRequests: env.IS_PROD ? [] : null,
        workerSrc: ["'self'"],
      },
    },
    strictTransportSecurity: env.IS_PROD,
  };

  helmet(options)(request, response, next);
}
