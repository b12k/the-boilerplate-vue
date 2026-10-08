import type { Promisable } from 'type-fest';

import { loggerService } from '@server/services/logger.service';
import { randomUUID } from 'node:crypto';

import { LruCache } from './lru.cache';
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
  redisUrl?: string | undefined;
  renderCacheTtlSec: number;
}
class CacheService {
  public cacheType!: 'L' | 'R';

  private config!: CacheClientConfig;

  private criticalCssCache!: CacheClient;

  private renderCache!: CacheClient;

  public async getCriticalCss(key: string) {
    const css = await this.criticalCssCache.get(this.saltCriticalCssKey(key));
    return css === 'pending' || css?.startsWith(PENDING_CSS_PREFIX)
      ? undefined
      : css;
  }

  public getRender(key: string) {
    return this.renderCache.get(this.saltRenderKey(key));
  }

  public async initialize(config: CacheClientConfig) {
    this.config = config;
    if (!config.redisUrl) {
      this.initializeLruCaches();
      return;
    }

    try {
      const client = new RedisCache(config.redisUrl, config.renderCacheTtlSec);
      await client.connect();
      this.renderCache = client;
      this.criticalCssCache = client;
      this.cacheType = 'R';
    } catch (error) {
      loggerService.logger.error(
        error,
        '[CacheService] Connection to redis server failed!',
      );
      this.initializeLruCaches();
    }
  }

  public async setCriticalCss(key: string, css: string, pendingCss: string) {
    await this.criticalCssCache.setIfValue(
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
        ? await this.criticalCssCache.setIfAbsent(
            saltedKey,
            pendingCss,
            budgetSec,
          )
        : await this.criticalCssCache.setIfValue(
            saltedKey,
            pendingCss,
            cachedCss,
            budgetSec,
          );
    return isPending ? pendingCss : undefined;
  }

  public async setRender(key: string, value: string) {
    const saltedKey = this.saltRenderKey(key);

    await this.renderCache.set(saltedKey, value, this.config.renderCacheTtlSec);
  }

  private initializeLruCaches() {
    this.renderCache = new LruCache(this.config.renderCacheTtlSec);
    this.criticalCssCache = new LruCache(this.config.criticalCssCacheTtlSec);
    this.cacheType = 'L';
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
