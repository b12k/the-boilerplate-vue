import type { RenderResult } from '@app/server.entry';
import type { Context } from '@server/services';
import type { Request, Response } from 'express';

import { env } from '@server/env';
import {
  cacheService,
  computeIdempotencyKey,
  getCriticalCss,
  getPageAssets,
  loadSsrAssets,
} from '@server/services';
import {
  createSsrResponseBudget,
  parseJson,
  stringToBase64,
  trackServerTask,
} from '@server/utils';
import { isEqual } from 'es-toolkit/predicate';
import nunjucks from 'nunjucks';
import { stringify } from 'safe-stable-stringify';

import { getContext } from './context.middleware';

async function cacheCriticalCss({
  cachedCss,
  cacheKey,
  cssFiles,
  renderedHtml,
}: {
  cachedCss?: string | undefined;
  cacheKey: string;
  cssFiles: Array<string>;
  renderedHtml: string;
}) {
  const shouldCacheCss = await cacheService.setCriticalCssPending(
    cacheKey,
    cachedCss,
  );
  if (!shouldCacheCss) return;

  const criticalCss = await getCriticalCss(renderedHtml, cssFiles);
  await cacheService.setCriticalCss(cacheKey, criticalCss);
}

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
  const ssrAbortController = new AbortController();
  const ssrResponseBudget = createSsrResponseBudget(
    env.SSR_RESPONSE_BUDGET_MS,
    ssrAbortController.signal,
  );
  const responseStartedAtMs = Date.now();
  const context = getContext();
  const renderCacheKey = context.isRenderCacheEnabled
    ? computeIdempotencyKey(context)
    : false;
  let shouldCacheRender = false;

  function handleClientDisconnect() {
    if (!response.writableFinished) {
      ssrAbortController.abort(new Error('SSR client disconnected'));
    }
  }

  response.once('close', handleClientDisconnect);
  if (response.destroyed) handleClientDisconnect();

  function discardRenderPending() {
    if (renderCacheKey === false || !shouldCacheRender) return;
    shouldCacheRender = false;
    // Pending cleanup must not delay the timeout response.
    trackServerTask(cacheService.deleteRenderPending(renderCacheKey)).catch(
      (error: unknown) => {
        request.log.error(error, 'Failed to delete SSR render pending');
      },
    );
  }

  try {
    const preparedResponse = await ssrResponseBudget.waitFor(async () => {
      try {
        const { manifest, render } = await loadSsrAssets();
        ssrResponseBudget.assertIsWithinBudget();
        const renderCacheResult = await readRenderCache(
          renderCacheKey,
          context,
          context.shouldRefreshRenderCache,
        );
        ({ shouldCacheRender } = renderCacheResult);
        ssrResponseBudget.assertIsWithinBudget();
        const renderResult =
          renderCacheResult.hit ??
          (await render(
            { ...context },
            request.log,
            ssrAbortController.signal,
          ));
        ssrResponseBudget.assertIsWithinBudget();
        const { currentRoute, head, html, modules, state } = renderResult;
        const pageAssets = getPageAssets(manifest, modules);
        const criticalCssCacheKey = context.isCriticalCssCacheEnabled
          ? stringToBase64(currentRoute.name)
          : undefined;
        const criticalCssCacheHit =
          await readCriticalCssCache(criticalCssCacheKey);
        ssrResponseBudget.assertIsWithinBudget();
        const serializedState = stringify(state);
        const responseHtml = nunjucks.render('index.njk', {
          context,
          criticalCss: criticalCssCacheHit?.css,
          head,
          html,
          nonce: request.nonce,
          pageAssets,
          state: serializedState.replaceAll('<', String.raw`\u003C`),
        });
        const renderResultJson = shouldCacheRender
          ? JSON.stringify(renderResult)
          : undefined;
        ssrResponseBudget.assertIsWithinBudget();
        return {
          criticalCssCacheHit,
          criticalCssCacheKey,
          isRenderCached: Boolean(renderCacheResult.hit),
          pageAssets,
          renderResult,
          renderResultJson,
          responseHtml,
        };
      } catch (error) {
        // Remove pending even if SET NX succeeds after timeout or client disconnect.
        discardRenderPending();
        throw error;
      }
    });
    ssrResponseBudget.assertIsWithinBudget();
    const {
      criticalCssCacheHit,
      criticalCssCacheKey,
      isRenderCached,
      pageAssets,
      renderResult,
      renderResultJson,
      responseHtml,
    } = preparedResponse;
    if (criticalCssCacheHit) {
      response.setHeader('X-Cache-Critical-Css', criticalCssCacheHit.key);
    }
    if (isRenderCached) {
      response.setHeader('X-Cache-Render', renderCacheKey.toString());
    }
    response
      .setHeader('X-Response-Time', Date.now() - responseStartedAtMs)
      .status(renderResult.currentRoute.meta.responseCode ?? 200)
      .send(responseHtml);

    if (renderCacheKey !== false && renderResultJson !== undefined) {
      if (ssrResponseBudget.checkIsExpired()) {
        discardRenderPending();
      } else {
        try {
          await cacheService.setRender(renderCacheKey, renderResultJson);
        } catch (error) {
          request.log.error(error, 'Failed to cache SSR render');
        }
      }
    }
    if (
      criticalCssCacheKey &&
      (!criticalCssCacheHit || context.shouldRefreshCriticalCssCache)
    ) {
      try {
        await cacheCriticalCss({
          cachedCss: criticalCssCacheHit?.css,
          cacheKey: criticalCssCacheKey,
          cssFiles: pageAssets.css,
          renderedHtml: renderResult.html,
        });
      } catch (error) {
        request.log.error(error, 'Failed to generate critical CSS');
      }
    }
  } catch (error) {
    ssrAbortController.abort(error);
    discardRenderPending();
    if (response.destroyed) return;
    throw error;
  } finally {
    response.off('close', handleClientDisconnect);
  }
}
