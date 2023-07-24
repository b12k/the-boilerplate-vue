import { Request } from 'express';

import { env as _env, Env } from '../env';
import { createRequestPropertyExtractor, overrideEnv } from '../utils';

export const buildContext = (request: Request) => {
  const getRequestProperty = createRequestPropertyExtractor(request);
  const enableDebugProperty = getRequestProperty('ENABLE_DEBUG');
  const envOverridesProperty = getRequestProperty('ENV_OVERRIDES');
  const isCache =
    _env.CACHE === 'true' && getRequestProperty('CACHE') !== 'false';
  const isRenderCache =
    isCache &&
    _env.RENDER_CACHE === 'true' &&
    getRequestProperty('RENDER_CACHE') !== 'false';
  const isCriticalCssCache =
    isCache &&
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

  return {
    isDebug,
    isCache,
    isRenderCache,
    isCriticalCssCache,
    isEnvOverridden: env.IS_OVERRIDDEN === 'true',
    shouldRefreshRenderCache,
    shouldRefreshCriticalCssCache,
    url: request.url,
    lang: request.params.lang,
    query: request.query,
    isProd: env.NODE_ENV !== 'development',
    version: env.VERSION,
    baseUrl: request.baseUrl,
    requestId: typeof request.id === 'object' ? '' : request.id.toString(),
  };
};

export type Context = ReturnType<typeof buildContext>;
