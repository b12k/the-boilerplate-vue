import compression from '@nitedani/shrink-ray-current';
import cookieParser from 'cookie-parser';
import express, { static as serveStatic } from 'express';
import { once } from 'node:events';
import nunjucks from 'nunjucks';

import { env } from './env';
import {
  cacheControlMiddleware,
  contextMiddleware,
  errorMiddleware,
  healthMiddleware,
  helmetMiddleware,
  languageMiddleware,
  mocksRouter,
  readinessMiddleware,
  setStaticCacheHeaders,
  sourceMapsMiddleware,
  ssrMiddleware,
} from './middleware';
import {
  cacheService,
  closeCriticalCssPool,
  destroyCriticalCssPool,
  loadSsrAssets,
  loggerService,
} from './services';
import {
  acceptedLanguages,
  getLanguage,
  installGracefulShutdown,
  liveReload,
  printDevelopmentBanner,
  serverReadiness,
  trackServerTask,
} from './utils';

const METHOD_NOT_ALLOWED_STATUS = 405;
const ssrPaths = acceptedLanguages.map((lang) => `/${lang}{/*ssrPath}`);

async function startServer() {
  cacheService.initialize();
  await loadSsrAssets();

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
    .use(loggerService)
    .use(cacheControlMiddleware)
    .use(liveReload)
    .use(cookieParser())
    .use(compression())
    .get('/favicon.ico', (_request, response) =>
      response
        .setHeader('Cache-Control', 'no-cache')
        .sendFile(env.FAVICON_PATH, { cacheControl: false }),
    )
    .all('/favicon.ico', (request, response) =>
      response
        .setHeader('Allow', 'GET, HEAD, OPTIONS')
        .status(request.method === 'OPTIONS' ? 200 : METHOD_NOT_ALLOWED_STATUS)
        .end(),
    )
    .get('/health', healthMiddleware)
    .use(readinessMiddleware)
    .use('/api/mocks', mocksRouter)
    .use('/{:lang}', languageMiddleware)
    .use('/{:lang}', contextMiddleware)
    .use(
      '/public',
      sourceMapsMiddleware,
      serveStatic(env.PUBLIC_PATH, {
        cacheControl: false,
        etag: false,
        setHeaders: setStaticCacheHeaders,
      }),
    )
    .use(helmetMiddleware)
    .get(ssrPaths, (request, response) =>
      trackServerTask(ssrMiddleware(request, response)),
    )
    .all(ssrPaths, (_request, response) =>
      response
        .setHeader('Allow', 'GET, HEAD')
        .sendStatus(METHOD_NOT_ALLOWED_STATUS),
    )
    .use('/{*splat}', (request, response) =>
      response.status(404).render('404', {
        lang: getLanguage(request),
        nonce: request.nonce,
      }),
    )
    .use(errorMiddleware);

  const server = app.listen(env.PORT);
  installGracefulShutdown({
    budgetMs: env.SHUTDOWN_BUDGET_MS,
    closeResources: async () => {
      await closeCriticalCssPool();
      await cacheService.close();
    },
    forceCloseResources: () => {
      destroyCriticalCssPool();
      cacheService.destroy();
    },
    logger: loggerService.logger,
    server,
  });
  await once(server, 'listening');
  serverReadiness.isReady = !serverReadiness.isDraining;
  if (!env.IS_PROD) printDevelopmentBanner(env.PORT);
}

try {
  await startServer();
} catch (error) {
  loggerService.logger.fatal(error);
  cacheService.destroy();
  process.exitCode = 1;
}
