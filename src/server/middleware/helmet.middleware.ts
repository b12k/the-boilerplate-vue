import type { NextFunction, Request, Response } from 'express';

import { env } from '@server/env';
import helmet, { contentSecurityPolicy } from 'helmet';
import { randomUUID } from 'node:crypto';

const helmetMiddleware = helmet({
  contentSecurityPolicy: false,
  strictTransportSecurity: env.IS_PROD,
});

function setHtmlSecurityHeaders(request: Request, response: Response) {
  request.nonce ??= randomUUID();
  const developmentSources = env.IS_PROD
    ? []
    : [
        'http://localhost:*',
        'http://127.0.0.1:*',
        'ws://localhost:*',
        'ws://127.0.0.1:*',
      ];
  contentSecurityPolicy({
    directives: {
      childSrc: ["'self'"],
      connectSrc: [
        "'self'",
        new URL(env.API_URL).origin,
        ...developmentSources,
      ],
      imgSrc: ["'self'", 'data:'],
      scriptSrc: [
        "'self'",
        `'nonce-${request.nonce}'`,
        ...developmentSources,
        // Rspack's development eval-source-map executes modules through eval().
        ...(env.IS_PROD ? [] : ["'unsafe-eval'"]),
      ],
      // oxlint-disable-next-line unicorn/no-null -- Helmet requires null to remove this default directive.
      upgradeInsecureRequests: env.IS_PROD ? [] : null,
      workerSrc: ["'self'"],
    },
  })(request, response, (error) => {
    if (error) throw error;
  });
}

function htmlSecurityMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  setHtmlSecurityHeaders(request, response);
  next();
}

export { helmetMiddleware, htmlSecurityMiddleware, setHtmlSecurityHeaders };
