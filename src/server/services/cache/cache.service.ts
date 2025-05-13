import { LruCache } from './lru.cache';
import { RedisCache } from './redis.cache';

export interface CacheClient {
  get: (
    key: string,
    isSlidingCache?: boolean,
  ) => Promise<string | undefined> | string | undefined;
  set: (key: string, value: string, ttlSec?: number) => void;
}

interface CacheClientConfig {
  criticalCssCacheSalt: string;
  criticalCssCacheTtl: number;
  redisUrl?: string;
  renderCacheSalt: string;
  renderCacheTtl: number;
}
export class CacheService {
  public cacheType!: 'L' | 'R';

  private cache!: CacheClient;

  private config!: CacheClientConfig;

  private criticalCssCache!: CacheClient;

  private isInitialized = false;

  private renderCache!: CacheClient;

  async getCriticalCss(key: string, isSlidingCache = false) {
    if (!this.isInitialized) return;

    const saltedKey = this.saltCriticalCssKey(key);

    const value = await this.criticalCssCache.get(saltedKey);

    if (value && isSlidingCache) this.setCriticalCss(key, value);

    return value;
  }

  async getRender(key: string, isSlidingCache = false) {
    if (!this.isInitialized) return;

    const saltedKey = this.saltRenderKey(key);

    const value = await this.renderCache.get(saltedKey);

    if (value && isSlidingCache) this.setRender(key, value);

    return value;
  }

  async initialize(config: CacheClientConfig) {
    this.config = config;

    if (config.redisUrl) {
      try {
        const client = new RedisCache(config.redisUrl, config.renderCacheTtl);
        await client.connect();
        this.renderCache = client;
        this.criticalCssCache = client;
        this.cache = client;
        this.isInitialized = true;
        this.cacheType = 'R';
        return;
      } catch {
        console.error('[CacheService] Connection to redis server failed!');
      }
    }
    this.renderCache = new LruCache(config.renderCacheTtl);
    this.criticalCssCache = new LruCache(config.criticalCssCacheTtl);
    this.isInitialized = true;
    this.cacheType = 'L';
  }

  setCriticalCss(key: string, value: string) {
    if (!this.isInitialized) return;

    const saltedKey = this.saltCriticalCssKey(key);

    return this.criticalCssCache.set(
      saltedKey,
      value,
      this.config.criticalCssCacheTtl,
    );
  }

  setRender(key: string, value: string) {
    if (!this.isInitialized) return;

    const saltedKey = this.saltRenderKey(key);

    return this.renderCache.set(saltedKey, value, this.config.renderCacheTtl);
  }

  private saltCriticalCssKey(key: string) {
    return ['[CRITICAL-CSS]', this.config.criticalCssCacheSalt, key].join(':');
  }

  private saltRenderKey(key: string) {
    return ['[RENDER]', this.config.renderCacheSalt, key].join(':');
  }
}

export const cacheService = new CacheService();
