import LRU from 'lru-cache';
import { createClient } from 'redis';

import { env } from '../env';

type CacheServiceConfig = {
  ttl: number;
  redisUrl?: string;
  cacheKeySalt?: string;
};

const cacheServiceDefaultConfig: CacheServiceConfig = {
  ttl: Number(env.CACHE_TTL) || 60 * 60 * 24, // One day cache
};

class CacheService {
  private readonly config: CacheServiceConfig;

  private readonly lruCache;

  private readonly redisCache;

  constructor(config: Partial<CacheServiceConfig> = {}) {
    this.config = {
      ...cacheServiceDefaultConfig,
      ...config,
    };

    if (this.config.redisUrl) {
      this.redisCache = createClient({
        url: this.config.redisUrl,
      });
    } else {
      this.lruCache = new LRU({ max: 5000, ttl: this.config.ttl * 1000 });
    }
  }

  private saltKey(key: string) {
    return [this.config.cacheKeySalt, key].join(',');
  }

  async get(key: string, ttlReset = false) {
    let value: string | undefined;

    if (this.lruCache)
      value = this.lruCache.get(this.saltKey(key)) || undefined;

    if (this.redisCache)
      value = (await this.redisCache.get(this.saltKey(key))) || undefined;

    if (ttlReset && value) this.set(key, value);

    return value;
  }

  set(key: string, value: string, ttl = this.config.ttl) {
    if (this.lruCache) this.lruCache.set(this.saltKey(key), value);
    if (this.redisCache)
      this.redisCache.set(this.saltKey(key), value, { EX: ttl });
  }
}

export const cacheService = new CacheService({
  ttl: Number(env.CACHE_TTL),
  redisUrl: env.REDIS_URL,
  cacheKeySalt: env.CACHE_KEY_SALT,
});
