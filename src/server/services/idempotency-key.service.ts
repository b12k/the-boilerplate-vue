import { createHash } from 'node:crypto';
import { match } from 'path-to-regexp';

import { Context } from './context-builder.service';
import config from '../idempotency.config';

type FalsyValue = false | null | undefined | 0;

type ComputeKeyFunction = (
  context: Context,
  params: Record<string, string>,
) => string | FalsyValue;

type BeforeAfterComputeKeyFunction = (
  context: Context,
  params: Record<string, string>,
) => string | boolean;

export type IdempotencyConfig = {
  paths: Record<string, ComputeKeyFunction>;
  beforeCompute?: BeforeAfterComputeKeyFunction;
  afterCompute?: BeforeAfterComputeKeyFunction;
};

const trimSlashes = (path: string) => path.replaceAll(/^\/|\/$/g, '');

const hashKey = (key: string) =>
  createHash('sha256').update(key).digest('base64');

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

  if (!matched) return false;

  const params = matched.params as Record<string, string>;

  const keyBeforeComputed = config.beforeCompute
    ? config.beforeCompute(context, params)
    : '';

  if (keyBeforeComputed === false) return false;

  const computedKey = config.paths[matched.key](context, params);

  if (!computedKey) return false;

  const keyAfterComputed = config.afterCompute
    ? config.afterCompute(context, params)
    : '';

  if (keyAfterComputed === false) return false;

  return hashKey(`${keyBeforeComputed}${computedKey}${keyAfterComputed}`);
};
