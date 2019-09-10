import express, { static as serveStatic } from 'express';
import cookieParser from 'cookie-parser';
import compression from 'shrink-ray-current';
import nunjucks from 'nunjucks';
import path from 'path';
import { times } from 'lodash';

import {
  IS_PROD,
  waitDevServer,
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
  if (!IS_PROD) {
    console.clear(); // eslint-disable-line
    await waitDevServer();
  }

  const {
    env: {
      PORT,
      ACCEPTED_LANGUAGES,
    },
  } = process;
  const publicPath = resolvePath('dist/public');
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
    .use('/public', serveStatic(publicPath))
    .get('/', languageController())
    .use(appBasePath, contextMiddleware())
    .use(appBasePath, applicationMiddleware())
    .use(notFoundMiddleware())
    .use(serverErrorMiddleware())
    .listen(PORT, appListenCallback);
})();
