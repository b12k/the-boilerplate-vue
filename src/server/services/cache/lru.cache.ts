import { LRUCache } from 'lru-cache';
import type { CacheClient } from './cache.service';

export class LruCache implements CacheClient {
  private readonly client;

  constructor(ttl: number) {
    this.client = new LRUCache<string, string>({
      max: 10_000,
      ttl: ttl * 1000,
    });
  }

  get(key: string) {
    return this.client.get(key);
  }

  set(key: string, value: string) {
    this.client.set(key, value);
  }
}
