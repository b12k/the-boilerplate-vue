import type { Env } from '@server/env';
import type { Request } from 'express';

import { env as baseEnv } from '@server/env';
import { createRequestPropertyExtractor, overrideEnv } from '@server/utils';
import { UAParser } from 'ua-parser-js';
import { z } from 'zod';

type BuildContext = ReturnType<typeof buildContext>;

type Context = BuildContext & {
  cached?: BuildContext | undefined;
};
interface Device {
  type: 'desktop' | 'mobile' | 'tablet';
}
function buildContext(request: Request) {
  const getRequestProperty = createRequestPropertyExtractor(request);
  const debugOnKeyProperty = getRequestProperty('DEBUG_ON_KEY');
  const envOverridesProperty = getRequestProperty('ENV_OVERRIDES');
  const isCacheEnabled =
    baseEnv.IS_CACHE_ON && getRequestProperty('IS_CACHE_ON') !== 'false';
  const isRenderCacheEnabled =
    isCacheEnabled &&
    baseEnv.IS_RENDER_CACHE_ON &&
    getRequestProperty('IS_RENDER_CACHE_ON') !== 'false';
  const isCriticalCssCacheEnabled =
    isCacheEnabled &&
    baseEnv.IS_CRITICAL_CSS_CACHE_ON &&
    getRequestProperty('IS_CRITICAL_CSS_CACHE_ON') !== 'false';
  const shouldRefreshRenderCache =
    getRequestProperty('REFRESH_RENDER_CACHE') === 'true';
  const shouldRefreshCriticalCssCache =
    getRequestProperty('REFRESH_CRITICAL_CSS_CACHE') === 'true';
  const isDebug =
    baseEnv.IS_DEBUG_ON ||
    (Boolean(baseEnv.DEBUG_ON_KEY) &&
      baseEnv.DEBUG_ON_KEY === debugOnKeyProperty);

  let env: Env = baseEnv;
  if (isDebug && envOverridesProperty) {
    try {
      const envOverrides = z
        .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
        .parse(JSON.parse(envOverridesProperty));
      env = overrideEnv(env, envOverrides);
    } catch {
      env.IS_OVERRIDDEN = false;
    }
  }
  const uaParser = new UAParser(request.headers['user-agent']);
  const {
    device: { type: detectedDeviceType },
  } = uaParser.getResult();

  const deviceType =
    detectedDeviceType === 'mobile' || detectedDeviceType === 'tablet'
      ? detectedDeviceType
      : 'desktop';
  const device: Device = { type: deviceType };
  const query: Record<string, unknown> = request.query;

  return {
    baseUrl: request.baseUrl,
    device,
    isCacheEnabled,
    isContextPatched: false,
    isCriticalCssCacheEnabled,
    isDebug,
    isEnvOverridden: env.IS_OVERRIDDEN,
    isProd: env.NODE_ENV !== 'development',
    isRenderCacheEnabled,
    lang: request.params['lang'],
    query,
    requestId: request.requestId,
    shouldRefreshCriticalCssCache,
    shouldRefreshRenderCache,
    url: request.url,
    version: env.VERSION,
  };
}

export { buildContext, type Context };
