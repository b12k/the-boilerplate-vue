import LRU from 'lru-cache';
import { createClient } from 'redis';

const {
  env: {
    CACHE_TTL = 60 * 60, // Default: 1h
  },
} = process;

const LRU_MAX_ENTRIES = 10000; // Default LRU cache size

export default class Cache {
  constructor(REDIS_URL, entryTtl = CACHE_TTL) {
    this.entryTtl = entryTtl;
    if (REDIS_URL) {
      this.isRedis = true;
      this.cache = createClient(REDIS_URL);
    } else {
      this.isRedis = false;
      this.cache = new LRU(LRU_MAX_ENTRIES);
    }
  }

  get(key, cb = () => {}) {
    return new Promise((resolve, reject) => {
      const returnValue = (value) => {
        resolve(value);
        cb(value);
      };

      if (this.isRedis) {
        this.cache.get(key, (err, value) => {
          if (err) reject(err);
          return returnValue(value);
        });
      }

      return returnValue(this.cache.get(key));
    });

  }

  set(key, value, ttl = this.entryTtl) {
    if (this.isRedis) {
      this.cache.set(key, value, 'EX', ttl);
    } else {
      this.cache.set(key, value, ttl * 1000); // LRU accepts TTL in milliseconds
    }
    return this;
  }
}
