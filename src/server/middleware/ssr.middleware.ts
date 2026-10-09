import type { RenderResult } from '@app/server.entry';
import type { Context } from '@server/services';
import type { Request, Response } from 'express';

import {
  cacheService,
  computeIdempotencyKey,
  getCriticalCss,
  loadSsrAssets,
} from '@server/services';
import { parseJson, stringToBase64 } from '@server/utils';
import { isEqual } from 'es-toolkit/predicate';
import nunjucks from 'nunjucks';
import { stringify } from 'safe-stable-stringify';

import { getContext } from './context.middleware';

async function readCriticalCssCache(key: string | undefined) {
  const cachedCss = key ? await cacheService.getCriticalCss(key) : undefined;
  return key && cachedCss !== undefined ? { css: cachedCss, key } : undefined;
}

async function readRenderCache(
  key: false | string,
  context: Context,
  shouldRefresh: boolean,
) {
  if (key === false) return { hit: undefined, shouldCacheRender: false };

  const { isPending, render: renderResultJson } =
    await cacheService.getRender(key);
  if (isPending) return { hit: undefined, shouldCacheRender: false };

  if (!renderResultJson || shouldRefresh) {
    const shouldCacheRender = await cacheService.setRenderPending(
      key,
      renderResultJson,
    );
    return { hit: undefined, shouldCacheRender };
  }

  const renderResult = parseJson<RenderResult>(renderResultJson);
  const cachedContext = renderResult.state.context;
  if (isEqual(context, cachedContext)) {
    return { hit: renderResult, shouldCacheRender: false };
  }

  renderResult.state.context = context;
  renderResult.state.context.isContextPatched = true;
  renderResult.state.context.cached = cachedContext;

  return { hit: renderResult, shouldCacheRender: false };
}

export async function ssrMiddleware(request: Request, response: Response) {
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
  const { hit: cachedRenderResult, shouldCacheRender } = await readRenderCache(
    renderCacheKey,
    context,
    shouldRefreshRenderCache,
  );
  const isRenderCached = Boolean(cachedRenderResult);
  const renderResult =
    cachedRenderResult ?? (await render({ ...context }, request.log));
  const { currentRoute, head, html, state } = renderResult;
  const criticalCssCacheKey = isCriticalCssCacheEnabled
    ? stringToBase64(currentRoute.name)
    : undefined;

  const criticalCssCacheHit = await readCriticalCssCache(criticalCssCacheKey);
  const criticalCss = criticalCssCacheHit?.css;
  const isCriticalCssCached = Boolean(criticalCssCacheHit);
  const serializedState = stringify(state);
  const page = nunjucks.render('index.njk', {
    context,
    criticalCss,
    head,
    html,
    manifest,
    nonce: request.nonce,
    state: serializedState.replaceAll('<', String.raw`\u003C`),
  });
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

  if (renderCacheKey !== false && shouldCacheRender) {
    try {
      await cacheService.setRender(
        renderCacheKey,
        JSON.stringify(renderResult),
      );
    } catch (error) {
      request.log.error(error, 'Failed to cache SSR render');
    }
  }

  if (
    criticalCssCacheKey &&
    (!isCriticalCssCached || shouldRefreshCriticalCssCache)
  ) {
    try {
      const shouldCacheCss = await cacheService.setCriticalCssPending(
        criticalCssCacheKey,
        criticalCss,
      );
      if (!shouldCacheCss) return;

      const css = await getCriticalCss(html, [
        ...manifest.css.initial,
        ...manifest.css.async,
      ]);
      await cacheService.setCriticalCss(criticalCssCacheKey, css);
    } catch (error) {
      request.log.error(error, 'Failed to generate critical CSS');
    }
  }
}
