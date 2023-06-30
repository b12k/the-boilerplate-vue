import compression from 'shrink-ray-without-zopfli';
import express, { static as serveStatic } from 'express';
import nunjucks from 'nunjucks';
import cookieParser from 'cookie-parser';
import serveFavicon from 'serve-favicon';

import { env } from './env';

import {
  ssrMiddleware,
  errorMiddleware,
  healthMiddleware,
  helmetMiddleware,
  contextMiddleware,
  languageMiddleware,
} from './middleware';
import { cacheService, loggerService } from './services';
import { getLanguage, printDevelopmentBanner } from './utils';

export const startServer = async () => {
  await cacheService.initialize({
    redisUrl: env.REDIS_URL,
    renderCacheTtl: Number(env.RENDER_CACHE_TTL),
    renderCacheSalt: env.RENDER_CACHE_SALT,
    criticalCssCacheTtl: Number(env.CRITICAL_CSS_CACHE_TTL),
    criticalCssCacheSalt: env.CRITICAL_CSS_CACHE_SALT,
  });

  const app = express();

  nunjucks
    .configure(env.VIEWS_PATH, {
      express: app,
      autoescape: true,
    })
    .addGlobal('env', env);

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
        maxAge: '7d',
        etag: false,
      }),
    )
    .use('/:lang?', languageMiddleware)
    .use('/:lang?', contextMiddleware);

  if (env.SERVER_ENV === 'production') app.use(helmetMiddleware);

  app
    .use('/:lang(de|en)', ssrMiddleware)
    .use('*', (request, response) =>
      response.status(404).render('404', { lang: getLanguage(request) }),
    )
    .use(errorMiddleware)
    .listen(
      env.PORT,
      () =>
        env.SERVER_ENV === 'local' && printDevelopmentBanner(Number(env.PORT)),
    );
};
