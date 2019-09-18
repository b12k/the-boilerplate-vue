import express, { static as serveStatic } from 'express';
import cookieParser from 'cookie-parser';
import compression from 'shrink-ray-current';
import nunjucks from 'nunjucks';
import path from 'path';
import serveFavicon from 'serve-favicon';

import {
  IS_PROD,
  waitForDevServer,
  appListenCallback,
  resolvePath,
} from './helpers';

import {
  contextMiddleware,
  notFoundMiddleware,
  serverErrorMiddleware,
  applicationMiddleware,
} from './middleware';

import {
  languageController,
} from './controllers';

(async () => {
  if (!IS_PROD) await waitForDevServer();

  const {
    env: {
      PORT,
      ACCEPTED_LANGUAGES,
    },
  } = process;
  const publicPath = resolvePath('dist/public');
  const ssrPath = resolvePath('dist/ssr');
  const faviconPath = resolvePath('dist/public/favicon.ico');
  const viewsPath = path.resolve(__dirname, 'views');
  const server = express();
  const appBasePath = `/:lang(${ACCEPTED_LANGUAGES})`;

  nunjucks.configure(viewsPath, {
    express: server,
    autoescape: true,
  });

  server
    .set('view engine', 'njk')
    .use(cookieParser())
    .use(compression())
    .use(serveFavicon(faviconPath))
    .use('/ping', (req, res) => res.send('pong'))
    .use('/ssr', serveStatic(ssrPath))
    .use('/public', serveStatic(publicPath))
    .get('/', languageController())
    .use(appBasePath, contextMiddleware())
    .use(appBasePath, applicationMiddleware())
    .use(notFoundMiddleware())
    .use(serverErrorMiddleware())
    .listen(PORT, appListenCallback);
})();
