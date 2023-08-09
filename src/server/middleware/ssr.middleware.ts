import { RequestHandler } from 'express';
import serialize from 'serialize-javascript';
import nunjucks from 'nunjucks';
import { diff } from 'deep-object-diff';

import type { RenderResult } from '@client';
import {
  loadSsrAssets,
  computeIdempotencyKey,
  cacheService,
  getCriticalCss,
  BuildContext,
  Context,
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
      isRenderCacheEnabled,
      isCriticalCssCacheEnabled,
      shouldRefreshRenderCache,
      shouldRefreshCriticalCssCache,
    } = context;

    let isCriticalCssCached = false;
    let isRenderCached = false;

    const renderCacheKey =
      isRenderCacheEnabled && computeIdempotencyKey(context);
    const { render, manifest } = await loadSsrAssets();

    /**
     * APPLICATION RENDER CACHE
     */

    let renderResult: RenderResult | undefined;

    if (renderCacheKey && !shouldRefreshRenderCache) {
      const renderResultJson = await cacheService.getRender(renderCacheKey);

      if (renderResultJson) {
        isRenderCached = true;

        renderResult = JSON.parse(renderResultJson) as RenderResult;

        const cachedContextDiff = diff(
          context,
          renderResult.state.context,
        ) as Partial<BuildContext>;

        if (cachedContextDiff) {
          renderResult.state.context = context;
          renderResult.state.context.isContextPatched = true;
          renderResult.state.context.cached = cachedContextDiff;
        }
      }
    }

    /**
     * RENDER APPLICATION
     */

    if (!renderResult) {
      renderResult = await render({ ...context }, request.log);
    }

    if (!renderResult) {
      throw new Error('[SSR-MIDDLEWARE] Missing render result');
    }

    const { currentRoute, head, html, state } = renderResult;

    /**
     * CRITICAL CSS
     */

    const criticalCssCacheKey =
      isCriticalCssCacheEnabled &&
      stringToBase64((currentRoute.name || currentRoute.path).toString());

    let criticalCss: string | undefined;

    if (criticalCssCacheKey) {
      const cachedCriticalCss = await cacheService.getCriticalCss(
        criticalCssCacheKey,
      );
      criticalCss =
        cachedCriticalCss === 'pending' ? undefined : cachedCriticalCss;

      isCriticalCssCached = Boolean(criticalCss);
    }

    /**
     * RENDER TEMPLATE
     */

    const page = nunjucks.render('index.njk', {
      head,
      html,
      state: serialize(state),
      context,
      manifest,
      criticalCss,
    });

    /**
     * RESPONSE
     */

    if (isCriticalCssCached || isRenderCached) {
      response.setHeader('X-Cache', cacheService.cacheType);
    }

    if (isCriticalCssCached) {
      response.setHeader(
        'X-Cache-Critical-Css',
        criticalCssCacheKey.toString(),
      );
    }

    if (isRenderCached) {
      response.setHeader('X-Cache-Render', renderCacheKey.toString());
    }

    response
      .setHeader('X-Response-Time', Date.now() - responseStartedAt)
      .status(Number(currentRoute.meta.responseCode) || 200)
      .send(page);

    /**
     * POST RESPONSE
     */

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
      const {
        state: { context: renderedContext },
      } = renderResult;
      if (renderedContext.isContextPatched) {
        renderResult.state.context = {
          ...renderedContext,
          ...renderedContext.cached,
          isContextPatched: false,
          cached: undefined,
        } as Context;
      }
      cacheService.setRender(renderCacheKey, JSON.stringify(renderResult));
    }
  } catch (error) {
    next(error);
  }
};
