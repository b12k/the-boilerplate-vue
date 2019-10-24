import { getPageCacheConfig } from '../helpers';
import {
  Application,
  Cache,
  minifyHtml,
} from '../services';

const {
  env: {
    REDIS_URL,
  },
} = process;

export default () => {
  const criticalCssCachePrefix = 'CRITICAL-CSS';
  const cache = new Cache(REDIS_URL);

  const app = new Application(cache);

  const render = async (context) => {
    const criticalCssCacheKey = `${criticalCssCachePrefix}:${context.path}`;
    const html = await app.renderToString(context);
    let criticalCss = await cache.get(criticalCssCacheKey) || '';
    if (!criticalCss) {
      criticalCss = await app.criticalCss.extract(html);
      cache.set(criticalCssCacheKey, criticalCss);
    }
    const htmlWithCriticalCss = await app.criticalCss.inject(html, criticalCss);
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

    const statusCode = context.state.route.name === 'NotFound'
      ? 404
      : 200;

    return res
      .status(statusCode)
      .send(html);
  };
};
