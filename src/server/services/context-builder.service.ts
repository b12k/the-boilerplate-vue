import type { Env } from '@server/env';
import type { Request } from 'express';

import { env as baseEnv } from '@server/env';
import {
  createRequestPropertyExtractor,
  overrideEnv,
  parseJson,
} from '@server/utils';
import { UAParser } from 'ua-parser-js';

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
  const isDebug =
    baseEnv.DEBUG ||
    (Boolean(baseEnv.DEBUG_ON_KEY) &&
      baseEnv.DEBUG_ON_KEY === debugOnKeyProperty);
  const shouldRefreshRenderCache =
    isDebug && getRequestProperty('REFRESH_RENDER_CACHE') === 'true';
  const shouldRefreshCriticalCssCache =
    isDebug && getRequestProperty('REFRESH_CRITICAL_CSS_CACHE') === 'true';

  let env: Env = baseEnv;
  if (isDebug && envOverridesProperty) {
    try {
      const envOverrides = parseJson<Partial<Env>>(envOverridesProperty);
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
    canServeSourceMaps: env.SERVE_SOURCE_MAPS,
    device,
    isContextPatched: false,
    isCriticalCssCacheEnabled: env.CACHE_CRITICAL_CSS,
    isDebug,
    isEnvOverridden: env.IS_OVERRIDDEN,
    isProd: env.NODE_ENV !== 'development',
    isRenderCacheEnabled: env.CACHE_RENDER,
    lang: request.params['lang'],
    query,
    shouldRefreshCriticalCssCache,
    shouldRefreshRenderCache,
    url: request.url,
    version: env.VERSION,
  };
}

export { buildContext, type Context };
