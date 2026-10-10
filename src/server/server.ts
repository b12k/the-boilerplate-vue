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
  mocksRouter,
  readinessMiddleware,
  sourceMapsMiddleware,
  ssrMiddleware,
} from './middleware';
import { cacheService, loadSsrAssets, loggerService } from './services';
import {
  acceptedLanguages,
  getLanguage,
  installGracefulShutdown,
  liveReload,
  printDevelopmentBanner,
  serverReadiness,
  trackServerTask,
} from './utils';

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
    .use(liveReload)
    .use(cookieParser())
    .use(compression())
    .use(serveFavicon(env.FAVICON_PATH))
    .use('/health', healthMiddleware)
    .use(readinessMiddleware)
    .use('/api/mocks', mocksRouter)
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
      (request, response) => trackServerTask(ssrMiddleware(request, response)),
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
      await cacheService.close();
    },
    forceCloseResources: () => {
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
