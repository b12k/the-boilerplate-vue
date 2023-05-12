import { RequestHandler } from 'express';
import serialize from 'serialize-javascript';
import nunjucks from 'nunjucks';

import { RenderResult } from '@client';
import {
  loadSsrAssets,
  computeIdempotencyKey,
  cacheService,
  getCriticalCss,
} from '../services';
import { getContext } from './context.middleware';
import { stringToBase64 } from '../utils';

export const ssrMiddleware: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const responseStartedAt = Date.now();
    const context = getContext();
    const {
      isRenderCache,
      isCriticalCssCache,
      shouldRefreshRenderCache,
      shouldRefreshCriticalCssCache,
    } = context;

    const renderCacheKey = isRenderCache && computeIdempotencyKey(context);
    const { render, manifest } = await loadSsrAssets();

    response.setHeader('X-Cache-Type', cacheService.cacheType);

    let renderResult: RenderResult | undefined;

    if (renderCacheKey && !shouldRefreshRenderCache) {
      const renderResultJson = await cacheService.getRender(
        renderCacheKey,
        true,
      );
      if (renderResultJson) {
        renderResult = JSON.parse(renderResultJson) as RenderResult;
        response.setHeader('X-Idempotency-Key', renderCacheKey);
      }
    }

    if (!renderResult) {
      renderResult = await render({ ...context }, request.log);
    }

    if (!renderResult) {
      throw new Error('[SSR-MIDDLEWARE] Missing render result');
    }

    const { currentRoute, head, html, state } = renderResult;

    const criticalCssCacheKey =
      isCriticalCssCache &&
      stringToBase64((currentRoute.name || currentRoute.path).toString());

    let criticalCss: string | undefined;

    if (criticalCssCacheKey) {
      criticalCss = await cacheService.getCriticalCss(
        criticalCssCacheKey,
        true,
      );
      if (criticalCss && criticalCss !== 'pending') {
        response.setHeader('X-Critical-Css-Cache-Key', criticalCssCacheKey);
      }
    }

    const page = nunjucks.render('index.njk', {
      head,
      html,
      state: serialize(state),
      context,
      manifest,
      criticalCss: criticalCss !== 'pending' && criticalCss,
    });

    response
      .setHeader('X-Response-Time', Date.now() - responseStartedAt)
      .status(Number(currentRoute.meta.responseCode) || 200)
      .send(page);

    if (
      criticalCssCacheKey &&
      criticalCss !== 'pending' &&
      (!criticalCss || shouldRefreshCriticalCssCache)
    ) {
      cacheService.setCriticalCss(criticalCssCacheKey, 'pending');
      criticalCss = await getCriticalCss(html, [
        ...manifest.css.initial,
        ...manifest.css.async,
      ]);
      cacheService.setCriticalCss(criticalCssCacheKey, criticalCss);
    }

    if (renderCacheKey) {
      cacheService.setRender(renderCacheKey, JSON.stringify(renderResult));
    }
  } catch (error) {
    next(error);
  }
};
