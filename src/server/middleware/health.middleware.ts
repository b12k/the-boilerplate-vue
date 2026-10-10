import type { Request, Response } from 'express';

import { serverReadiness } from '@server/utils';

const SERVICE_UNAVAILABLE_STATUS = 503;
const startedAt = Date.now();

export function healthMiddleware(_: Request, response: Response) {
  let status = 'STARTING';
  if (serverReadiness.isDraining) status = 'DRAINING';
  if (serverReadiness.isReady) status = 'OK';
  response
    .status(serverReadiness.isReady ? 200 : SERVICE_UNAVAILABLE_STATUS)
    .send({
      ready: serverReadiness.isReady,
      status,
      uptime: Date.now() - startedAt,
    });
}
