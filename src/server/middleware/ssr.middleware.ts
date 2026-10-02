import type { RenderResult } from '@app/server.entry';
import type { Context } from '@server/services';
import type { Request, Response } from 'express';

import {
  cacheService,
  computeIdempotencyKey,
  getCriticalCss,
  loadSsrAssets,
} from '@server/services';
import { stringToBase64 } from '@server/utils';
import { isEqual } from 'es-toolkit/predicate';
import nunjucks from 'nunjucks';
import { stringify } from 'safe-stable-stringify';

import { getContext } from './context.middleware';

async function readCriticalCssCache(key: string | undefined) {
  if (!key) return { hit: undefined, isPending: false };

  const cachedCss = await cacheService.getCriticalCss(key);
  const isPending = cachedCss === 'pending';
  if (!cachedCss || isPending) return { hit: undefined, isPending };

  return { hit: { css: cachedCss, key }, isPending };
}

async function readRenderCache(
  key: false | string,
  context: Context,
  shouldRefresh: boolean,
) {
  if (key === false || shouldRefresh) return { hit: undefined };

  const renderResultJson = await cacheService.getRender(key);
  if (!renderResultJson) return { hit: undefined };

  // This middleware reads only the RenderResult JSON it writes to the cache.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const renderResult = JSON.parse(renderResultJson) as RenderResult;
  const cachedContext = renderResult.state.context;
  if (isEqual(context, cachedContext)) return { hit: renderResult };

  renderResult.state.context = context;
  renderResult.state.context.isContextPatched = true;
  renderResult.state.context.cached = cachedContext;

  return { hit: renderResult };
}

async function renderSsr(request: Request, response: Response) {
  const responseStartedAt = Date.now();
  const context = getContext();
  const {
    isCriticalCssCacheEnabled,
    isRenderCacheEnabled,
    shouldRefreshCriticalCssCache,
    shouldRefreshRenderCache,
  } = context;

  const renderCacheKey = isRenderCacheEnabled
    ? computeIdempotencyKey(context)
    : false;
  const { manifest, render } = await loadSsrAssets();

  // Section Read Cache
  /*
   *   ____                _     ____           _
   *  |  _ \ ___  __ _  __| |   / ___|__ _  ___| |__   ___
   *  | |_) / _ \/ _` |/ _` |  | |   / _` |/ __| '_ \ / _ \
   *  |  _ <  __/ (_| | (_| |  | |__| (_| | (__| | | |  __/
   *  |_| \_\___|\__,_|\__,_|   \____\__,_|\___|_| |_|\___|
   *
   */

  const { hit: cachedRenderResult } = await readRenderCache(
    renderCacheKey,
    context,
    shouldRefreshRenderCache,
  );
  const isRenderCached = Boolean(cachedRenderResult);

  // Section Render
  /*
   *   ____                _
   *  |  _ \ ___ _ __   __| | ___ _ __
   *  | |_) / _ \ '_ \ / _` |/ _ \ '__|
   *  |  _ <  __/ | | | (_| |  __/ |
   *  |_| \_\___|_| |_|\__,_|\___|_|
   *
   */

  const renderResult =
    cachedRenderResult ?? (await render({ ...context }, request.log));

  const { currentRoute, head, html, state } = renderResult;

  // Section Critical CSS
  /*
   *    ____      _ _   _           _     ____ ____ ____
   *   / ___|_ __(_) |_(_) ___ __ _| |   / ___/ ___/ ___|
   *  | |   | '__| | __| |/ __/ _` | |  | |   \___ \___ \
   *  | |___| |  | | |_| | (_| (_| | |  | |___ ___) |__) |
   *   \____|_|  |_|\__|_|\___\__,_|_|   \____|____/____/
   *
   */

  const criticalCssCacheKey = isCriticalCssCacheEnabled
    ? stringToBase64(currentRoute.name)
    : undefined;

  const { hit: criticalCssCacheHit, isPending } =
    await readCriticalCssCache(criticalCssCacheKey);
  let criticalCss = criticalCssCacheHit?.css;
  const isCriticalCssCached = Boolean(criticalCssCacheHit);

  // Section Template
  /*
   *   _____                    _       _
   *  |_   _|__ _ __ ___  _ __ | | __ _| |_ ___
   *    | |/ _ \ '_ ` _ \| '_ \| |/ _` | __/ _ \
   *    | |  __/ | | | | | |_) | | (_| | ||  __/
   *    |_|\___|_| |_| |_| .__/|_|\__,_|\__\___|
   *                     |_|
   */

  const serializedState = stringify(state);

  const page = nunjucks.render('index.njk', {
    context,
    criticalCss,
    head,
    html,
    manifest,
    state: serializedState.replaceAll('<', String.raw`\u003C`),
  });

  // Section Response
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

  if (criticalCssCacheHit) {
    response.setHeader('X-Cache-Critical-Css', criticalCssCacheHit.key);
  }

  if (isRenderCached) {
    response.setHeader('X-Cache-Render', renderCacheKey.toString());
  }

  response
    .setHeader('X-Response-Time', Date.now() - responseStartedAt)
    .status(currentRoute.meta.responseCode ?? 200)
    .send(page);

  // Section Set Cache
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
    !isPending &&
    (!criticalCss || shouldRefreshCriticalCssCache)
  ) {
    await cacheService.setCriticalCss(criticalCssCacheKey, 'pending');
    criticalCss = await getCriticalCss(html, [
      ...manifest.css.initial,
      ...manifest.css.async,
    ]);
    await cacheService.setCriticalCss(criticalCssCacheKey, criticalCss);
  }

  if (renderCacheKey === false) return;

  const { context: renderedContext } = state;
  if (renderedContext.isContextPatched) {
    state.context = {
      ...renderedContext,
      ...renderedContext.cached,
      cached: undefined,
      isContextPatched: false,
    };
  }

  await cacheService.setRender(renderCacheKey, JSON.stringify(renderResult));
}

function ssrMiddleware(request: Request, response: Response) {
  return renderSsr(request, response);
}

export { ssrMiddleware };
