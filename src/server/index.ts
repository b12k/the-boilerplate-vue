import compression from '@nitedani/shrink-ray-current';
import cookieParser from 'cookie-parser';
import express, { static as serveStatic } from 'express';
import { configure as nunjucksConfigure } from 'nunjucks';
import serveFavicon from 'serve-favicon';

import { env } from './env';
import {
  contextMiddleware,
  errorMiddleware,
  healthMiddleware,
  helmetMiddleware,
  languageMiddleware,
  ssrMiddleware,
} from './middleware';
import { cacheService, loggerService } from './services';
import {
  acceptedLanguages,
  getLanguage,
  printDevelopmentBanner,
} from './utils';

void (async () => {
  await cacheService.initialize({
    criticalCssCacheSalt: env.CRITICAL_CSS_CACHE_SALT,
    criticalCssCacheTtl: Number(env.CRITICAL_CSS_CACHE_TTL),
    redisUrl: env.REDIS_URL,
    renderCacheSalt: env.RENDER_CACHE_SALT,
    renderCacheTtl: Number(env.RENDER_CACHE_TTL),
  });

  const app = express();

  nunjucksConfigure(env.VIEWS_PATH, {
    autoescape: true,
    express: app,
  }).addGlobal('env', env);

  app
    .set('view engine', 'njk')
    .set('etag', false)
    .use(loggerService)
    .use(cookieParser())
    .use(compression())
    .use(serveFavicon(env.FAVICON_PATH))
    .use('/health', healthMiddleware)
    .use(
      '/public',
      serveStatic(env.PUBLIC_PATH, {
        etag: false,
        maxAge: '7d',
      }),
    )
    .use('/{:lang}', languageMiddleware)
    .use('/{:lang}', contextMiddleware)
    .use(helmetMiddleware(env.IS_PROD === 'true'))
    .use(
      acceptedLanguages.map((lang) => `/${lang}`),
      ssrMiddleware,
    )
    .use('/{*splat}', (request, response) =>
      response.status(404).render('404', {
        lang: getLanguage(request),
        requestId: typeof request.id === 'object' ? '' : request.id.toString(),
      }),
    )
    .use(errorMiddleware)
    .listen(
      env.PORT,
      () => env.IS_PROD !== 'true' && printDevelopmentBanner(Number(env.PORT)),
    );
})();

export type { Context } from './services';
