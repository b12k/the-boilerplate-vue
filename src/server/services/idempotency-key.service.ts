import type { Context } from '@server';

import { idempotencyConfig } from '@server/idempotency.config';
import { createHash } from 'node:crypto';
import { match } from 'path-to-regexp';

type BeforeAfterComputeKeyFunction = (
  context: Context,
  parameters: Record<string, string>,
) => boolean | string;

type ComputeKeyFunction = (
  context: Context,
  parameters: Record<string, string>,
) => FalsyValue | string;

type FalsyValue = 0 | false | null | undefined;

interface IdempotencyConfig {
  afterCompute?: BeforeAfterComputeKeyFunction;
  beforeCompute?: BeforeAfterComputeKeyFunction;
  paths: Record<string, ComputeKeyFunction>;
}

function computeIdempotencyKey(context: Context) {
  const { baseUrl, url } = context;
  const fullUrl = trimSlashes(baseUrl + url);
  const matched = Object.entries(idempotencyConfig.paths)
    .map(([key, computeKey]) => {
      const matchedPath = match(trimSlashes(key), {
        decode: decodeURIComponent,
      })(fullUrl);
      return matchedPath === false
        ? undefined
        : { computeKey, params: matchedPath.params };
    })
    .find(Boolean);

  if (!matched) return false;

  const parameters: Record<string, string> = {};
  for (const [name, parameter] of Object.entries(matched.params)) {
    parameters[name] = Array.isArray(parameter)
      ? parameter.join('/')
      : String(parameter);
  }

  const keyBeforeComputed = idempotencyConfig.beforeCompute
    ? idempotencyConfig.beforeCompute(context, parameters)
    : '';

  if (keyBeforeComputed === false) return false;

  const computedKey = matched.computeKey(context, parameters);

  if (typeof computedKey !== 'string' || !computedKey) {
    return false;
  }

  const keyAfterComputed = idempotencyConfig.afterCompute
    ? idempotencyConfig.afterCompute(context, parameters)
    : '';

  if (keyAfterComputed === false) return false;

  return hashKey(`${keyBeforeComputed}${computedKey}${keyAfterComputed}`);
}

function hashKey(key: string) {
  return createHash('sha256').update(key).digest('base64');
}

function trimSlashes(path: string) {
  return path.replaceAll(/^\/|\/$/gu, '');
}

export { computeIdempotencyKey, type IdempotencyConfig };
