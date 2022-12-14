import { match } from 'path-to-regexp';
import { createHash } from 'node:crypto';

import { Context } from './context-builder.service';
import config from '../idempotency.config';

export type IdempotencyConfig = {
  paths: Record<
    string,
    (params: Record<string, string>, context: Context) => undefined | string
  >;
  afterKeyComputed?: (
    key: string,
    params: Record<string, string>,
    context: Context,
  ) => undefined | string;
};

const trimSlashes = (string_: string) => string_.replaceAll(/^\/|\/$/g, '');

export const computeIdempotencyKey = (context: Context) => {
  const { baseUrl, url } = context;
  const fullUrl = trimSlashes(baseUrl + url);

  const matched = Object.keys(config.paths)
    .map((key) => {
      const matchedPath = match(trimSlashes(key), {
        decode: decodeURIComponent,
      })(fullUrl);
      return matchedPath ? { key, params: matchedPath.params } : undefined;
    })
    .find(Boolean);

  const key =
    matched &&
    config.paths[matched.key](
      matched.params as Record<string, string>,
      context,
    );

  return key && createHash('sha256').update(key).digest('base64');
};
