import { match } from 'path-to-regexp';
import { createHash } from 'node:crypto';

import { Context } from './context-builder.service';
import config from '../idempotency.config';

type ComputeIdempotencyKeyFunction = (
  context: Context,
  params: Record<string, string>,
) => undefined | string;

export type IdempotencyConfig = {
  paths: Record<string, ComputeIdempotencyKeyFunction>;
  afterCompute?: (
    key: string,
    context: Context,
    params: Record<string, string>,
  ) => string | undefined;
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

  let key: string | undefined;

  if (!matched) return key;

  const params = matched.params as Record<string, string>;

  key = config.paths[matched.key](context, params);

  if (!key) return key;

  if (config.afterCompute) {
    key = config.afterCompute(key, context, params);
  }

  return key && createHash('sha256').update(key).digest('base64');
};
