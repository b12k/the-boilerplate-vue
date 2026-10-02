import { LRUCache } from 'lru-cache';

import type { CacheClient } from './cache.service';

const MS_PER_SEC = 1000;

class LruCache implements CacheClient {
  private readonly client;

  public constructor(ttlSec: number) {
    this.client = new LRUCache<string, string>({
      max: 10_000,
      ttl: ttlSec * MS_PER_SEC,
    });
  }

  public get(key: string) {
    return this.client.get(key);
  }

  public set(key: string, value: string) {
    this.client.set(key, value);
  }
}

export { LruCache };
