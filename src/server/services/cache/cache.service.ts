import { RedisCache } from './redis.cache';
import { LruCache } from './lru.cache';

export interface CacheClient {
  get: (
    key: string,
    isSlidingCache?: boolean,
  ) => Promise<string | undefined> | string | undefined;
  set: (key: string, value: string, ttlSec?: number) => void;
}

interface CacheClientConfig {
  redisUrl?: string;
  renderCacheTtl: number;
  renderCacheSalt: string;
  criticalCssCacheTtl: number;
  criticalCssCacheSalt: string;
}
export class CacheService {
  private isInitialized = false;

  private cache!: CacheClient;

  private renderCache!: CacheClient;

  private criticalCssCache!: CacheClient;

  private config!: CacheClientConfig;

  public cacheType!: 'R' | 'L';

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
        // eslint-disable-next-line no-console
        console.error('[CacheService] Connection to redis server failed!');
      }
    }
    this.renderCache = new LruCache(config.renderCacheTtl);
    this.criticalCssCache = new LruCache(config.criticalCssCacheTtl);
    this.isInitialized = true;
    this.cacheType = 'L';
  }

  private saltRenderKey(key: string) {
    return ['[RENDER]', this.config.renderCacheSalt, key].join(':');
  }

  private saltCriticalCssKey(key: string) {
    return ['[CRITICAL-CSS]', this.config.criticalCssCacheSalt, key].join(':');
  }

  async getRender(key: string, isSlidingCache = false) {
    if (!this.isInitialized) return undefined;

    const saltedKey = this.saltRenderKey(key);

    const value = await this.renderCache.get(saltedKey);

    if (value && isSlidingCache) this.setRender(key, value);

    return value;
  }

  setRender(key: string, value: string) {
    if (!this.isInitialized) return undefined;

    const saltedKey = this.saltRenderKey(key);

    return this.renderCache.set(saltedKey, value, this.config.renderCacheTtl);
  }

  async getCriticalCss(key: string, isSlidingCache = false) {
    if (!this.isInitialized) return undefined;

    const saltedKey = this.saltCriticalCssKey(key);

    const value = await this.criticalCssCache.get(saltedKey);

    if (value && isSlidingCache) this.setCriticalCss(key, value);

    return value;
  }

  setCriticalCss(key: string, value: string) {
    if (!this.isInitialized) return undefined;

    const saltedKey = this.saltCriticalCssKey(key);

    return this.criticalCssCache.set(
      saltedKey,
      value,
      this.config.criticalCssCacheTtl,
    );
  }
}

export const cacheService = new CacheService();
