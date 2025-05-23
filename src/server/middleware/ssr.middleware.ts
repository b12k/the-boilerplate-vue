import type { RenderResult } from '@client';
import type { RequestHandler } from 'express';

import { diff } from 'deep-object-diff';
import { render as nunjuksRender } from 'nunjucks';
import { stringify } from 'safe-stable-stringify';

import {
  type BuildContext,
  cacheService,
  computeIdempotencyKey,
  type Context,
  getCriticalCss,
  loadSsrAssets,
} from '../services';
import { stringToBase64 } from '../utils';
import { getContext } from './context.middleware';

export const ssrMiddleware: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const responseStartedAt = Date.now();
    const context = getContext();
    const {
      isCriticalCssCacheEnabled,
      isRenderCacheEnabled,
      shouldRefreshCriticalCssCache,
      shouldRefreshRenderCache,
    } = context;

    let isCriticalCssCached = false;
    let isRenderCached = false;

    const renderCacheKey =
      isRenderCacheEnabled && computeIdempotencyKey(context);
    const { manifest, render } = await loadSsrAssets();

    // section Read Cache
    /*
     *   ____                _     ____           _
     *  |  _ \ ___  __ _  __| |   / ___|__ _  ___| |__   ___
     *  | |_) / _ \/ _` |/ _` |  | |   / _` |/ __| '_ \ / _ \
     *  |  _ <  __/ (_| | (_| |  | |__| (_| | (__| | | |  __/
     *  |_| \_\___|\__,_|\__,_|   \____\__,_|\___|_| |_|\___|
     *
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

    // section Render
    /*
     *   ____                _
     *  |  _ \ ___ _ __   __| | ___ _ __
     *  | |_) / _ \ '_ \ / _` |/ _ \ '__|
     *  |  _ <  __/ | | | (_| |  __/ |
     *  |_| \_\___|_| |_|\__,_|\___|_|
     *
     */

    if (!renderResult) {
      renderResult = await render({ ...context }, request.log);
    }

    if (!renderResult) {
      throw new Error('[SSR-MIDDLEWARE] Missing render result');
    }

    const { currentRoute, head, html, state } = renderResult;

    // section Critical CSS
    /*
     *    ____      _ _   _           _     ____ ____ ____
     *   / ___|_ __(_) |_(_) ___ __ _| |   / ___/ ___/ ___|
     *  | |   | '__| | __| |/ __/ _` | |  | |   \___ \___ \
     *  | |___| |  | | |_| | (_| (_| | |  | |___ ___) |__) |
     *   \____|_|  |_|\__|_|\___\__,_|_|   \____|____/____/
     *
     */

    const criticalCssCacheKey =
      isCriticalCssCacheEnabled &&
      stringToBase64((currentRoute.name || currentRoute.path).toString());

    let criticalCss: string | undefined;

    if (criticalCssCacheKey) {
      const cachedCriticalCss =
        await cacheService.getCriticalCss(criticalCssCacheKey);

      criticalCss =
        cachedCriticalCss === 'pending' ? undefined : cachedCriticalCss;

      isCriticalCssCached = Boolean(criticalCss);
    }

    // section Template
    /*
     *   _____                    _       _
     *  |_   _|__ _ __ ___  _ __ | | __ _| |_ ___
     *    | |/ _ \ '_ ` _ \| '_ \| |/ _` | __/ _ \
     *    | |  __/ | | | | | |_) | | (_| | ||  __/
     *    |_|\___|_| |_| |_| .__/|_|\__,_|\__\___|
     *                     |_|
     */

    const page = nunjuksRender('index.njk', {
      context,
      criticalCss,
      head,
      html,
      manifest,
      state: stringify(state),
    });

    // section Response
    /*
     *   ____
     *  |  _ \ ___  ___ _ __   ___  _ __  ___  ___
     *  | |_) / _ \/ __| '_ \ / _ \| '_ \/ __|/ _ \
     *  |  _ <  __/\__ \ |_) | (_) | | | \__ \  __/
     *  |_| \_\___||___/ .__/ \___/|_| |_|___/\___|
     *                 |_|
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

    // section Set Cache
    /*
     *   ____       _       ____           _
     *  / ___|  ___| |_    / ___|__ _  ___| |__   ___
     *  \___ \ / _ \ __|  | |   / _` |/ __| '_ \ / _ \
     *   ___) |  __/ |_   | |__| (_| | (__| | | |  __/
     *  |____/ \___|\__|   \____\__,_|\___|_| |_|\___|
     *
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
          cached: undefined,
          isContextPatched: false,
        } as Context;
      }

      cacheService.setRender(renderCacheKey, JSON.stringify(renderResult));
    }
  } catch (error) {
    next(error);
  }
};
