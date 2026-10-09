import type { Promisable } from 'type-fest';

import { env } from '@server/env';
import { loggerService } from '@server/services/logger.service';

import { RedisCache } from './redis.cache';

const PENDING = 'pending';
const PENDING_TTL_MARGIN_MS = 1000;
const MS_PER_SECOND = 1000;

interface CacheClient {
  get: (key: string) => Promisable<string | undefined>;
  set: (key: string, value: string, ttlSec?: number) => Promisable<void>;
  setIfAbsent: (
    key: string,
    value: string,
    ttlMs: number,
  ) => Promisable<boolean>;
  setIfValue: (
    key: string,
    value: string,
    expectedValue: string,
    ttlMs: number,
  ) => Promisable<boolean>;
}

class CacheService {
  public readonly cacheType = 'R';

  private client?: CacheClient;

  private static saltCriticalCssKey(key: string) {
    return ['[CRITICAL-CSS]', env.CACHE_SALT, key].join(':');
  }

  private static saltRenderKey(key: string) {
    return ['[RENDER]', env.CACHE_SALT, key].join(':');
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
    const client = new RedisCache(
      env.REDIS_URL,
      env.CACHE_RENDER_TTL_SEC,
      env.REDIS_CONNECTION_RETRIES,
      env.REDIS_READ_TIMEOUT_MS,
    );
    this.client = client;

    // oxlint-disable-next-line promise/prefer-await-to-callbacks, promise/prefer-await-to-then -- HTTP startup must not await the connection loop; terminal failures are handled here.
    client.connect().catch((error: unknown) => {
      loggerService.logger.error(
        error,
        '[CacheService] Connection to redis server failed!',
      );
    });
  }

  public async setCriticalCss(key: string, css: string) {
    await this.client?.setIfValue(
      CacheService.saltCriticalCssKey(key),
      css,
      PENDING,
      env.CACHE_CRITICAL_CSS_TTL_SEC * MS_PER_SECOND,
    );
  }

  public async setCriticalCssPending(key: string, cachedCss?: string) {
    const saltedKey = CacheService.saltCriticalCssKey(key);
    const ttlMs = env.CACHE_CRITICAL_CSS_BUDGET_MS + PENDING_TTL_MARGIN_MS;
    const isPending =
      cachedCss === undefined
        ? await this.client?.setIfAbsent(saltedKey, PENDING, ttlMs)
        : await this.client?.setIfValue(saltedKey, PENDING, cachedCss, ttlMs);
    return Boolean(isPending);
  }

  public setRender(key: string, render: string) {
    return this.client?.setIfValue(
      CacheService.saltRenderKey(key),
      render,
      PENDING,
      env.CACHE_RENDER_TTL_SEC * MS_PER_SECOND,
    );
  }

  public async setRenderPending(key: string, cachedRender?: string) {
    const saltedKey = CacheService.saltRenderKey(key);
    const ttlMs = env.SSR_RESPONSE_BUDGET_MS + PENDING_TTL_MARGIN_MS;
    const isPending =
      cachedRender === undefined
        ? await this.client?.setIfAbsent(saltedKey, PENDING, ttlMs)
        : await this.client?.setIfValue(
            saltedKey,
            PENDING,
            cachedRender,
            ttlMs,
          );
    return Boolean(isPending);
  }
}

const cacheService = new CacheService();

export { type CacheClient, cacheService };
