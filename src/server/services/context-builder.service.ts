import { Request } from 'express';

import {
  env as envPrivate,
  envPublic,
  EnvPublic as EnvironmentPublic,
} from '../env';
import {
  createRequestPropertyExtractor,
  overrideEnv as overrideEnvironment,
} from '../utils';

export const buildContext = (request: Request) => {
  const getRequestProperty = createRequestPropertyExtractor(request);

  const debugProperty = getRequestProperty('DEBUG');
  const envOverridesProperty = getRequestProperty('ENV_OVERRIDES');
  const isCachingEnabled = getRequestProperty('CACHE') !== 'false';
  const shouldRefreshCache = getRequestProperty('REFRESH_CACHE') === 'true';

  const isDebug =
    envPrivate.ENABLE_DEBUG === 'true' || envPrivate.DEBUG === debugProperty;
  let env: EnvironmentPublic = envPublic;

  if (isDebug && envOverridesProperty) {
    try {
      const envOverrides = JSON.parse(
        envOverridesProperty,
      ) as Partial<EnvironmentPublic>;
      env = overrideEnvironment(env, envOverrides);
    } catch {
      env.IS_OVERRIDDEN = 'false';
    }
  }

  return {
    env,
    isDebug,
    isCachingEnabled,
    shouldRefreshCache,
    url: request.url,
    lang: request.params.lang,
    baseUrl: request.baseUrl,
  };
};

export type Context = ReturnType<typeof buildContext>;
