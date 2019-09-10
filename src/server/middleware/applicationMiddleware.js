import nunjucks from 'nunjucks';
import { createBundleRenderer } from 'vue-server-renderer';
import path from 'path';

import {
  resolvePath,
  getPageCacheConfig,
} from '../helpers';
import {
  Cache,
  CriticalCss,
  minifyHtml,
} from '../services';

export default () => {
  const {
    env: {
      REDIS_URL,
    },
  } = process;
  const clientManifest = require(resolvePath('dist/public/json/clientManifest.json')); // eslint-disable-line
  const ssrBundle = require(resolvePath('dist/public/json/ssrBundle.json')); // eslint-disable-line
  const templatePath = path.resolve(__dirname, '../views/index.njk');
  const criticalCss = new CriticalCss(clientManifest);
  const criticalCssCachePrefix = 'CRITICAL-CSS';
  const cache = new Cache(REDIS_URL);

  const render = async (context) => {
    const { renderToString } = createBundleRenderer(ssrBundle, {
      cache,
      clientManifest,
      inject: false,
      template: nunjucks.render(templatePath, context),
    });
    const criticalCssCacheKey = `${criticalCssCachePrefix}:${context.path}`;
    console.log('Before render');
    const html = await renderToString(context);
    let cachedCriticalCss = await cache.get(criticalCssCacheKey);
    if (!cachedCriticalCss) {
      cachedCriticalCss = criticalCss.extract(html);
      cache.set(criticalCssCacheKey, cachedCriticalCss);
    }
    const htmlWithCriticalCss = criticalCss.inject(html, cachedCriticalCss);

    return minifyHtml(htmlWithCriticalCss);
  };

  return async (req, res, next) => {
    let html;
    const { context } = req;
    const pageCacheConfig = getPageCacheConfig(context);
    try {
      if (pageCacheConfig) {
        html = await cache.get(pageCacheConfig.key);
        if (!html) {
          html = await render(context);
          cache.set(pageCacheConfig.key, html, pageCacheConfig.ttl);
        }
      } else {
        html = await render(context);
      }
    } catch (e) {
      return next(e);
    }
    return res.send(html);
  };
};
