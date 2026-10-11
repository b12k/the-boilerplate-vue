import type { Context } from '@server/services';

import { idempotencyConfig } from '@server/idempotency.config';
import { mapValues } from 'es-toolkit/object';
import { createHash } from 'node:crypto';
import { match } from 'path-to-regexp';

type BeforeAfterComputeKeyFunction = (
  context: Context,
  routeParams: Record<string, string>,
) => boolean | string;

type ComputeKeyFunction = (
  context: Context,
  routeParams: Record<string, string>,
) => FalsyValue | string;

type FalsyValue = 0 | false | null | undefined;

interface IdempotencyConfig {
  afterCompute?: BeforeAfterComputeKeyFunction;
  beforeCompute?: BeforeAfterComputeKeyFunction;
  paths: Record<string, ComputeKeyFunction>;
}

function hashKey(key: string) {
  return createHash('sha256').update(key).digest('base64');
}

function trimSlashes(path: string) {
  return path.replaceAll(/^\/|\/$/gu, '');
}

function computeIdempotencyKey(context: Context) {
  const { baseUrl, url } = context;
  const pathname = trimSlashes((baseUrl + url).split('?')[0] ?? '');
  const matchedCacheRule = Object.entries(idempotencyConfig.paths)
    .map(([routePattern, computeKey]) => {
      const matchedPath = match(trimSlashes(routePattern), {
        decode: decodeURIComponent,
      })(pathname);
      return matchedPath === false
        ? undefined
        : { computeKey, params: matchedPath.params };
    })
    .find(Boolean);

  if (!matchedCacheRule) return false;

  const routeParams = mapValues(matchedCacheRule.params, (parameter) =>
    Array.isArray(parameter) ? parameter.join('/') : String(parameter),
  );

  const cacheKeyPrefix = idempotencyConfig.beforeCompute
    ? idempotencyConfig.beforeCompute(context, routeParams)
    : '';

  if (cacheKeyPrefix === false) return false;

  const routeCacheKey = matchedCacheRule.computeKey(context, routeParams);

  if (typeof routeCacheKey !== 'string' || !routeCacheKey) {
    return false;
  }

  const cacheKeySuffix = idempotencyConfig.afterCompute
    ? idempotencyConfig.afterCompute(context, routeParams)
    : '';

  if (cacheKeySuffix === false) return false;

  return hashKey(`${cacheKeyPrefix}${routeCacheKey}${cacheKeySuffix}`);
}

export { computeIdempotencyKey, type IdempotencyConfig };
