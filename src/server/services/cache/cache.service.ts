import type { Promisable } from 'type-fest';

import { loggerService } from '@server/services/logger.service';

import { LruCache } from './lru.cache';
import { RedisCache } from './redis.cache';

interface CacheClient {
  get: (
    key: string,
    isSlidingCache?: boolean,
  ) => Promisable<string | undefined>;
  set: (key: string, value: string, ttlSec?: number) => Promisable<void>;
}

interface CacheClientConfig {
  criticalCssCacheSalt: string;
  criticalCssCacheTtl: number;
  redisUrl?: string | undefined;
  renderCacheSalt: string;
  renderCacheTtl: number;
}
class CacheService {
  public cacheType!: 'L' | 'R';

  private config!: CacheClientConfig;

  private criticalCssCache!: CacheClient;

  private renderCache!: CacheClient;

  public async getCriticalCss(key: string, isSlidingCache = false) {
    const value = await this.criticalCssCache.get(this.saltCriticalCssKey(key));

    if (!value || !isSlidingCache) return value;

    await this.setCriticalCss(key, value);

    return value;
  }

  public async getRender(key: string, isSlidingCache = false) {
    const value = await this.renderCache.get(this.saltRenderKey(key));

    if (!value || !isSlidingCache) return value;

    await this.setRender(key, value);

    return value;
  }

  public async initialize(config: CacheClientConfig) {
    this.config = config;
    if (!config.redisUrl) {
      this.initializeLruCaches();
      return;
    }

    try {
      const client = new RedisCache(config.redisUrl, config.renderCacheTtl);
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

  public async setCriticalCss(key: string, value: string) {
    const saltedKey = this.saltCriticalCssKey(key);

    await this.criticalCssCache.set(
      saltedKey,
      value,
      this.config.criticalCssCacheTtl,
    );
  }

  public async setRender(key: string, value: string) {
    const saltedKey = this.saltRenderKey(key);

    await this.renderCache.set(saltedKey, value, this.config.renderCacheTtl);
  }

  private initializeLruCaches() {
    this.renderCache = new LruCache(this.config.renderCacheTtl);
    this.criticalCssCache = new LruCache(this.config.criticalCssCacheTtl);
    this.cacheType = 'L';
  }

  private saltCriticalCssKey(key: string) {
    return ['[CRITICAL-CSS]', this.config.criticalCssCacheSalt, key].join(':');
  }

  private saltRenderKey(key: string) {
    return ['[RENDER]', this.config.renderCacheSalt, key].join(':');
  }
}

const cacheService = new CacheService();

export { type CacheClient, cacheService };
