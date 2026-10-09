import type { RenderResult } from '@app/server.entry';
import type { Context } from '@server/services';
import type { Request, Response } from 'express';

import { env } from '@server/env';
import {
  cacheService,
  computeIdempotencyKey,
  getCriticalCss,
  loadSsrAssets,
} from '@server/services';
import { createSsrDeadline, parseJson, stringToBase64 } from '@server/utils';
import { isEqual } from 'es-toolkit/predicate';
import nunjucks from 'nunjucks';
import { stringify } from 'safe-stable-stringify';

import { getContext } from './context.middleware';

async function cacheCriticalCss(
  key: string,
  html: string,
  cssFiles: Array<string>,
  cachedCss?: string,
) {
  const shouldCacheCss = await cacheService.setCriticalCssPending(
    key,
    cachedCss,
  );
  if (!shouldCacheCss) return;

  const css = await getCriticalCss(html, cssFiles);
  await cacheService.setCriticalCss(key, css);
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
  const deadline = createSsrDeadline(env.SSR_RESPONSE_BUDGET_MS);
  const responseStartedAt = Date.now();
  const context = getContext();
  const renderCacheKey = context.isRenderCacheEnabled
    ? computeIdempotencyKey(context)
    : false;
  let shouldCacheRender = false;

  function discardRenderPending() {
    if (renderCacheKey === false || !shouldCacheRender) return;
    shouldCacheRender = false;
    // oxlint-disable-next-line promise/prefer-await-to-callbacks, promise/prefer-await-to-then -- Pending cleanup must not delay the timeout response; its rejection is handled here.
    cacheService.deleteRenderPending(renderCacheKey).catch((error: unknown) => {
      request.log.error(error, 'Failed to delete SSR render pending');
    });
  }

  try {
    const prepared = await deadline.waitFor(async () => {
      try {
        const { manifest, render } = await loadSsrAssets();
        deadline.assertIsWithinBudget();
        const cached = await readRenderCache(
          renderCacheKey,
          context,
          context.shouldRefreshRenderCache,
        );
        ({ shouldCacheRender } = cached);
        deadline.assertIsWithinBudget();
        const renderResult =
          cached.hit ?? (await render({ ...context }, request.log));
        deadline.assertIsWithinBudget();
        const { currentRoute, head, html, state } = renderResult;
        const criticalCssCacheKey = context.isCriticalCssCacheEnabled
          ? stringToBase64(currentRoute.name)
          : undefined;
        const criticalCssCacheHit =
          await readCriticalCssCache(criticalCssCacheKey);
        deadline.assertIsWithinBudget();
        const serializedState = stringify(state);
        const page = nunjucks.render('index.njk', {
          context,
          criticalCss: criticalCssCacheHit?.css,
          head,
          html,
          manifest,
          nonce: request.nonce,
          state: serializedState.replaceAll('<', String.raw`\u003C`),
        });
        const renderResultJson = shouldCacheRender
          ? JSON.stringify(renderResult)
          : undefined;
        deadline.assertIsWithinBudget();
        return {
          criticalCssCacheHit,
          criticalCssCacheKey,
          isRenderCached: Boolean(cached.hit),
          manifest,
          page,
          renderResult,
          renderResultJson,
        };
      } catch (error) {
        // A late SET NX acknowledgement can arrive after the outer timeout.
        discardRenderPending();
        throw error;
      }
    });
    deadline.assertIsWithinBudget();
    const {
      criticalCssCacheHit,
      criticalCssCacheKey,
      isRenderCached,
      manifest,
      page,
      renderResult,
      renderResultJson,
    } = prepared;
    if (criticalCssCacheHit || isRenderCached) {
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
      .status(renderResult.currentRoute.meta.responseCode ?? 200)
      .send(page);

    if (renderCacheKey !== false && renderResultJson !== undefined) {
      if (deadline.checkIsExpired()) {
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
        await cacheCriticalCss(
          criticalCssCacheKey,
          renderResult.html,
          [...manifest.css.initial, ...manifest.css.async],
          criticalCssCacheHit?.css,
        );
      } catch (error) {
        request.log.error(error, 'Failed to generate critical CSS');
      }
    }
  } catch (error) {
    discardRenderPending();
    throw error;
  }
}
