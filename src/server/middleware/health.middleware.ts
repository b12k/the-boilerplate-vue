import type { Request, Response } from 'express';

import { env } from '@server/env';
import { serverReadiness } from '@server/utils';

const SERVICE_UNAVAILABLE_STATUS = 503;
const serviceStartedAtMs = Date.now();

export function healthMiddleware(_: Request, response: Response) {
  let status = 'STARTING';
  if (serverReadiness.isDraining) status = 'DRAINING';
  if (serverReadiness.isReady) status = 'OK';
  response
    .setHeader('Cache-Control', 'no-store')
    .status(serverReadiness.isReady ? 200 : SERVICE_UNAVAILABLE_STATUS)
    .json({
      ready: serverReadiness.isReady,
      status,
      uptime: Date.now() - serviceStartedAtMs,
      version: env.VERSION,
    });
}
