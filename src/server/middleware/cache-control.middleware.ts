import type { NextFunction, Request, Response } from 'express';
import type { ServerResponse } from 'node:http';

import { env } from '@server/env';
import path from 'node:path';

function cacheControlMiddleware(
  _: Request,
  response: Response,
  next: NextFunction,
) {
  response.setHeader('Cache-Control', 'no-store');
  next();
}

function setStaticCacheHeaders(response: ServerResponse, filePath: string) {
  // Source-map access middleware already sets private, no-store.
  if (response.getHeader('Cache-Control') === 'private, no-store') return;

  const filename = path.basename(filePath);
  let cacheControl = 'no-cache';
  if (filename === 'manifest.json' || /\.(?:html?|map)$/iu.test(filename)) {
    cacheControl = 'no-store';
  } else if (env.IS_PROD && /\.[a-f\d]{8}\.[^.]+$/iu.test(filename)) {
    cacheControl = 'public, max-age=31536000, immutable';
  }
  response.setHeader('Cache-Control', cacheControl);
}

export { cacheControlMiddleware, setStaticCacheHeaders };
