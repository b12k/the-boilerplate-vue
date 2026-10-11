import type { Promisable } from 'type-fest';

import { env } from '@server/env';
import { loggerService } from '@server/services/logger.service';

import { RedisCache } from './redis.cache';

const PENDING = 'pending';
const PENDING_TTL_MARGIN_MS = 1000;

interface CacheClient {
  close: () => Promisable<void>;
  deleteIfValue: (key: string, expectedValue: string) => Promisable<boolean>;
  destroy: () => void;
  get: (key: string) => Promisable<string | undefined>;
  set: (key: string, value: string, ttlSec?: number) => Promisable<void>;
  setIfAbsent: (
    key: string,
    value: string,
    ttlMs: number,
  ) => Promisable<boolean>;
  setIfValue: (params: ConditionalCacheWriteParams) => Promisable<boolean>;
}

interface ConditionalCacheWriteParams {
  expectedValue: string;
  key: string;
  ttlMs: number;
  value: string;
}

class CacheService {
  private client?: CacheClient;

  private static saltCriticalCssKey(key: string) {
    return ['[CRITICAL-CSS]', env.CACHE_SALT, key].join(':');
  }

  private static saltRenderKey(key: string) {
    return ['[RENDER]', env.CACHE_SALT, key].join(':');
  }

  public async close() {
    await this.client?.close();
  }

  public async deleteCriticalCssPending(key: string) {
    await this.client?.deleteIfValue(
      CacheService.saltCriticalCssKey(key),
      PENDING,
    );
  }

  public async deleteRenderPending(key: string) {
    await this.client?.deleteIfValue(CacheService.saltRenderKey(key), PENDING);
  }

  public destroy() {
    this.client?.destroy();
  }

  public async getCriticalCss(key: string) {
    const css = await this.client?.get(CacheService.saltCriticalCssKey(key));
    return css === PENDING ? undefined : css;
  }

  public async getRender(key: string) {
    const render = await this.client?.get(CacheService.saltRenderKey(key));
    const isPending = render === PENDING;
    return { isPending, render: isPending ? undefined : render };
  }

  public initialize() {
    const client = new RedisCache({
      connectionRetriesCount: env.REDIS_CONNECTION_RETRIES,
      defaultTtlSec: env.CACHE_RENDER_TTL_SEC,
      readTimeoutMs: env.REDIS_READ_TIMEOUT_MS,
      redisUrl: env.REDIS_URL,
    });
    this.client = client;

    // HTTP startup must not await the connection loop.
    client.connect().catch((error: unknown) => {
      loggerService.logger.error(
        error,
        '[CacheService] Connection to redis server failed!',
      );
    });
  }

  public async setCriticalCss(key: string, css: string) {
    await this.client?.set(
      CacheService.saltCriticalCssKey(key),
      css,
      env.CACHE_CRITICAL_CSS_TTL_SEC,
    );
  }

  public async setCriticalCssPending(key: string, cachedCss?: string) {
    const saltedKey = CacheService.saltCriticalCssKey(key);
    const ttlMs = env.CACHE_CRITICAL_CSS_BUDGET_MS + PENDING_TTL_MARGIN_MS;
    const isPending =
      cachedCss === undefined
        ? await this.client?.setIfAbsent(saltedKey, PENDING, ttlMs)
        : await this.client?.setIfValue({
            expectedValue: cachedCss,
            key: saltedKey,
            ttlMs,
            value: PENDING,
          });
    return Boolean(isPending);
  }

  public setRender(key: string, render: string) {
    return this.client?.set(
      CacheService.saltRenderKey(key),
      render,
      env.CACHE_RENDER_TTL_SEC,
    );
  }

  public async setRenderPending(key: string, cachedRender?: string) {
    const saltedKey = CacheService.saltRenderKey(key);
    const ttlMs = env.SSR_RESPONSE_BUDGET_MS + PENDING_TTL_MARGIN_MS;
    const isPending =
      cachedRender === undefined
        ? await this.client?.setIfAbsent(saltedKey, PENDING, ttlMs)
        : await this.client?.setIfValue({
            expectedValue: cachedRender,
            key: saltedKey,
            ttlMs,
            value: PENDING,
          });
    return Boolean(isPending);
  }
}

const cacheService = new CacheService();

export { type CacheClient, cacheService, type ConditionalCacheWriteParams };
