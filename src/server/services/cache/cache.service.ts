import type { Promisable } from 'type-fest';

import { loggerService } from '@server/services/logger.service';
import { randomUUID } from 'node:crypto';

import { RedisCache } from './redis.cache';

const PENDING_CSS_PREFIX = 'pending:';

interface CacheClient {
  get: (key: string) => Promisable<string | undefined>;
  set: (key: string, value: string, ttlSec?: number) => Promisable<void>;
  setIfAbsent: (
    key: string,
    value: string,
    ttlSec: number,
  ) => Promisable<boolean>;
  setIfValue: (
    key: string,
    value: string,
    expectedValue: string,
    ttlSec: number,
  ) => Promisable<boolean>;
}

interface CacheClientConfig {
  cacheSalt: string;
  criticalCssCacheBudgetSec: number;
  criticalCssCacheTtlSec: number;
  redisConnectionRetries: number;
  redisReadTimeoutMs: number;
  redisUrl?: string | undefined;
  renderCacheTtlSec: number;
}
class CacheService {
  public readonly cacheType = 'R';

  private client?: CacheClient;

  private config!: CacheClientConfig;

  public async getCriticalCss(key: string) {
    const css = await this.client?.get(this.saltCriticalCssKey(key));
    return css === 'pending' || css?.startsWith(PENDING_CSS_PREFIX)
      ? undefined
      : css;
  }

  public getRender(key: string) {
    return this.client?.get(this.saltRenderKey(key));
  }

  public initialize(config: CacheClientConfig) {
    this.config = config;
    if (!config.redisUrl) return;

    const client = new RedisCache(
      config.redisUrl,
      config.renderCacheTtlSec,
      config.redisConnectionRetries,
      config.redisReadTimeoutMs,
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

  public async setCriticalCss(key: string, css: string, pendingCss: string) {
    await this.client?.setIfValue(
      this.saltCriticalCssKey(key),
      css,
      pendingCss,
      this.config.criticalCssCacheTtlSec,
    );
  }

  public async setCriticalCssPending(key: string, cachedCss?: string) {
    const saltedKey = this.saltCriticalCssKey(key);
    const pendingCss = `${PENDING_CSS_PREFIX}${randomUUID()}`;
    const budgetSec = this.config.criticalCssCacheBudgetSec;
    const isPending =
      cachedCss === undefined
        ? await this.client?.setIfAbsent(saltedKey, pendingCss, budgetSec)
        : await this.client?.setIfValue(
            saltedKey,
            pendingCss,
            cachedCss,
            budgetSec,
          );
    return isPending ? pendingCss : undefined;
  }

  public async setRender(key: string, value: string) {
    const saltedKey = this.saltRenderKey(key);

    await this.client?.set(saltedKey, value, this.config.renderCacheTtlSec);
  }

  private saltCriticalCssKey(key: string) {
    return ['[CRITICAL-CSS]', this.config.cacheSalt, key].join(':');
  }

  private saltRenderKey(key: string) {
    return ['[RENDER]', this.config.cacheSalt, key].join(':');
  }
}

const cacheService = new CacheService();

export { type CacheClient, cacheService };
