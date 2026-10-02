import compression from '@nitedani/shrink-ray-current';
import cookieParser from 'cookie-parser';
import express, { static as serveStatic } from 'express';
import nunjucks from 'nunjucks';
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
  liveReload,
  printDevelopmentBanner,
} from './utils';

async function startServer() {
  await cacheService.initialize({
    criticalCssCacheSalt: env.CRITICAL_CSS_CACHE_SALT,
    criticalCssCacheTtl: Number(env.CRITICAL_CSS_CACHE_TTL),
    redisUrl: env.REDIS_URL,
    renderCacheSalt: env.RENDER_CACHE_SALT,
    renderCacheTtl: Number(env.RENDER_CACHE_TTL),
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
    .use(liveReload(env.LIVE_RELOAD_PATH))
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
    .use(helmetMiddleware(env.IS_PROD))
    .use(
      acceptedLanguages.map((lang) => `/${lang}`),
      ssrMiddleware,
    )
    .use('/{*splat}', (request, response) =>
      response.status(404).render('404', {
        lang: getLanguage(request),
        requestId: request.requestId,
      }),
    )
    .use(errorMiddleware)
    .listen(env.PORT, () => {
      if (env.IS_PROD) return;
      printDevelopmentBanner(Number(env.PORT));
    });
}

try {
  await startServer();
} catch (error) {
  loggerService.logger.fatal(error);
  process.exitCode = 1;
}
