import compression from '@nitedani/shrink-ray-current';
import cookieParser from 'cookie-parser';
import express, { static as serveStatic } from 'express';
import { once } from 'node:events';
import nunjucks from 'nunjucks';
import serveFavicon from 'serve-favicon';

import { env } from './env';
import {
  contextMiddleware,
  errorMiddleware,
  healthMiddleware,
  helmetMiddleware,
  languageMiddleware,
  sourceMapsMiddleware,
  ssrMiddleware,
} from './middleware';
import { cacheService, loggerService } from './services';
import {
  acceptedLanguages,
  getLanguage,
  liveReload,
  printDevelopmentBanner,
} from './utils';

async function startServer() {
  await cacheService.initialize({
    criticalCssCacheBudgetSec: env.CACHE_CRITICAL_CSS_BUDGET_SEC,
    criticalCssCacheSalt: env.CACHE_CRITICAL_CSS_SALT,
    criticalCssCacheTtlSec: env.CACHE_CRITICAL_CSS_TTL_SEC,
    redisUrl: env.REDIS_URL,
    renderCacheSalt: env.CACHE_RENDER_SALT,
    renderCacheTtlSec: env.CACHE_RENDER_TTL_SEC,
  });

  const app = express();

  nunjucks
    .configure(env.VIEWS_PATH, {
      autoescape: true,
      express: app,
    })
    .addGlobal('env', env);

  app
    .set('view engine', 'njk')
    .set('etag', false)
    .use(liveReload)
    .use(loggerService)
    .use(cookieParser())
    .use(compression())
    .use(serveFavicon(env.FAVICON_PATH))
    .use('/health', healthMiddleware)
    .use('/{:lang}', languageMiddleware)
    .use('/{:lang}', contextMiddleware)
    .use(
      '/public',
      sourceMapsMiddleware,
      serveStatic(env.PUBLIC_PATH, {
        etag: false,
        maxAge: '7d',
      }),
    )
    .use(helmetMiddleware)
    .use(
      acceptedLanguages.map((lang) => `/${lang}`),
      ssrMiddleware,
    )
    .use('/{*splat}', (request, response) =>
      response.status(404).render('404', {
        lang: getLanguage(request),
        nonce: request.nonce,
      }),
    )
    .use(errorMiddleware);

  const server = app.listen(env.PORT);
  await once(server, 'listening');
  if (!env.IS_PROD) printDevelopmentBanner(env.PORT);
}

try {
  await startServer();
} catch (error) {
  loggerService.logger.fatal(error);
  process.exitCode = 1;
}
