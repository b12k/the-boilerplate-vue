/**  THIS DEPS ARE NEEDED ONLY IN DEV MODE */
import decache from 'decache'; // eslint-disable-line
import chokidar from 'chokidar'; // eslint-disable-line

import nunjucks from 'nunjucks';
import { createBundleRenderer } from 'vue-server-renderer';
import path from 'path';

import CriticalCss from './CriticalCss';
import {
  IS_PROD,
  resolvePath,
} from '../helpers';

const templatePath = path.resolve(__dirname, '../views/index.njk');
const clientManifestPath = resolvePath('dist/ssr/clientManifest.json');
const ssrBundlePath = resolvePath('dist/ssr/ssrBundle.json');

export default class Application {
  constructor(cache) {
    this.cache = cache;
    this.initialize();
    if (!IS_PROD) {
      chokidar
        .watch([ssrBundlePath, clientManifestPath])
        .on('change', () => {
          decache(ssrBundlePath);
          decache(clientManifestPath);
          this.initialize();
        });
    }
  }

  initialize() {
    this.clientManifest = require(clientManifestPath); // eslint-disable-line
    this.ssrBundle = require(ssrBundlePath); // eslint-disable-line
    this.criticalCss = new CriticalCss(this.clientManifest);
    this.renderToString = createBundleRenderer(this.ssrBundle, {
      cache: this.cache,
      clientManifest: this.clientManifest,
      template: nunjucks.render(templatePath, {}),
    }).renderToString;
  }

}
