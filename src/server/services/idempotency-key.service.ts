import { createHash } from 'node:crypto';
import { match } from 'path-to-regexp';

import config from '../idempotency.config';
import { type Context } from './context-builder.service';

export type IdempotencyConfig = {
  afterCompute?: BeforeAfterComputeKeyFunction;
  beforeCompute?: BeforeAfterComputeKeyFunction;
  paths: Record<string, ComputeKeyFunction>;
};

type BeforeAfterComputeKeyFunction = (
  context: Context,
  parameters: Record<string, string>,
) => boolean | string;

type ComputeKeyFunction = (
  context: Context,
  parameters: Record<string, string>,
) => FalsyValue | string;

type FalsyValue = 0 | false | null | undefined;

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

  const parameters = matched.params as Record<string, string>;

  const keyBeforeComputed = config.beforeCompute
    ? config.beforeCompute(context, parameters)
    : '';

  if (keyBeforeComputed === false) return false;

  const computedKey = config.paths[matched.key](context, parameters);

  if (!computedKey) return false;

  const keyAfterComputed = config.afterCompute
    ? config.afterCompute(context, parameters)
    : '';

  if (keyAfterComputed === false) return false;

  return hashKey(`${keyBeforeComputed}${computedKey}${keyAfterComputed}`);
};
