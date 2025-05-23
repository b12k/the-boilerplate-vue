import { type Request } from 'express';
import { UAParser } from 'ua-parser-js';

import { env as _env, type Env } from '../env';
import { createRequestPropertyExtractor, overrideEnv } from '../utils';

interface Device {
  type: 'desktop' | 'mobile' | 'tablet';
}

export const buildContext = (request: Request) => {
  const getRequestProperty = createRequestPropertyExtractor(request);
  const enableDebugProperty = getRequestProperty('ENABLE_DEBUG');
  const envOverridesProperty = getRequestProperty('ENV_OVERRIDES');
  const isCacheEnabled =
    _env.CACHE === 'true' && getRequestProperty('CACHE') !== 'false';
  const isRenderCacheEnabled =
    isCacheEnabled &&
    _env.RENDER_CACHE === 'true' &&
    getRequestProperty('RENDER_CACHE') !== 'false';
  const isCriticalCssCacheEnabled =
    isCacheEnabled &&
    _env.CRITICAL_CSS_CACHE === 'true' &&
    getRequestProperty('CRITICAL_CSS_CACHE') !== 'false';
  const shouldRefreshRenderCache =
    getRequestProperty('REFRESH_RENDER_CACHE') === 'true';
  const shouldRefreshCriticalCssCache =
    getRequestProperty('REFRESH_CRITICAL_CSS_CACHE') === 'true';
  const isDebug =
    _env.DEBUG === 'true' || _env.ENABLE_DEBUG === enableDebugProperty;

  let env: Env = _env;
  if (isDebug && envOverridesProperty) {
    try {
      const envOverrides = JSON.parse(envOverridesProperty) as Partial<Env>;
      env = overrideEnv(env, envOverrides);
    } catch {
      env.IS_OVERRIDDEN = 'false';
    }
  }
  const {
    device: { type: detectedDeviceType },
  } = new UAParser(request.headers['user-agent']).getResult();

  const device: Device = {
    type: 'mobile',
  };

  switch (detectedDeviceType) {
    case 'mobile':
    case 'tablet': {
      device.type = detectedDeviceType;
      break;
    }
    default: {
      device.type = 'desktop';
    }
  }

  return {
    baseUrl: request.baseUrl,
    device,
    isCacheEnabled,
    isContextPatched: false,
    isCriticalCssCacheEnabled,
    isDebug,
    isEnvOverridden: env.IS_OVERRIDDEN === 'true',
    isProd: env.NODE_ENV !== 'development',
    isRenderCacheEnabled,
    lang: request.params.lang,
    query: request.query,
    requestId: typeof request.id === 'object' ? '' : request.id.toString(),
    shouldRefreshCriticalCssCache,
    shouldRefreshRenderCache,
    url: request.url,
    version: env.VERSION,
  };
};

export type BuildContext = ReturnType<typeof buildContext>;
export type Context = BuildContext & { cached?: Partial<BuildContext> };
