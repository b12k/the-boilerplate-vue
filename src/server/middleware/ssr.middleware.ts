import { RequestHandler } from 'express';
import serialize from 'serialize-javascript';
import nunjucks from 'nunjucks';

import {
  loadSsrAssets,
  computeIdempotencyKey,
  cacheService,
  getCriticalCss,
} from '../services';
import { getContext } from './context.middleware';
import { env } from '../env';

export const ssrMiddleware: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const responseStartedAt = Date.now();

    const context = getContext();
    const { isCachingEnabled, shouldRefreshCache } = context;
    const pageCacheKey =
      env.CACHE_ENABLED === 'true' &&
      isCachingEnabled &&
      computeIdempotencyKey(context);

    if (pageCacheKey && !shouldRefreshCache) {
      const page = await cacheService.get(pageCacheKey, true);
      if (page) {
        return response
          .setHeader('X-Response-Time', Date.now() - responseStartedAt)
          .setHeader('X-Idempotency-Key', pageCacheKey)
          .send(page);
      }
    }

    const { render, manifest } = await loadSsrAssets();

    const renderStartedAt = Date.now();
    const { html, state, currentRoute } = await render({ ...context });
    response.setHeader('X-Render-Time', Date.now() - renderStartedAt);

    const criticalCssCacheKey =
      (isCachingEnabled &&
        currentRoute.name &&
        `[critical-css]:${String(currentRoute.name)}`) ||
      undefined;

    let criticalCss: Array<string> =
      ((criticalCssCacheKey &&
        JSON.parse(
          (await cacheService.get(criticalCssCacheKey, true)) || '[]',
        )) as Array<string>) || [];

    if (criticalCss.length === 0 || shouldRefreshCache) {
      const criticalCssStartedAt = Date.now();
      criticalCss = await getCriticalCss(html, [
        ...manifest.css.initial,
        ...manifest.css.async,
      ]);
      response.setHeader(
        'X-Critical-Css-Time',
        Date.now() - criticalCssStartedAt,
      );
    }

    const page = nunjucks.render('index.njk', {
      html,
      state: serialize(state),
      context,
      manifest,
      criticalCss,
    });

    if (criticalCssCacheKey) {
      cacheService.set(criticalCssCacheKey, JSON.stringify(criticalCss));
    }

    if (pageCacheKey) {
      cacheService.set(pageCacheKey, page);
    }

    return response
      .setHeader('X-Response-Time', Date.now() - responseStartedAt)
      .status(Number(currentRoute.meta.responseCode) || 200)
      .send(page);
  } catch (error) {
    return next(error);
  }
};
