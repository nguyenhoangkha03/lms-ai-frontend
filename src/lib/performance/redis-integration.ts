export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
  ttl: {
    default: number;
    long: number;
    short: number;
  };
}

export class RedisCache {
  private static instance: RedisCache;
  private config: RedisConfig;
  private client: any = null;

  constructor(config?: Partial<RedisConfig>) {
    this.config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: 'lms-ai:',
      ttl: {
        default: 3600, // 1 hour
        long: 86400, // 24 hours
        short: 300, // 5 minutes
      },
      ...config,
    };
  }

  static getInstance(): RedisCache {
    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache();
    }
    return RedisCache.instance;
  }

  async connect() {
    if (typeof window !== 'undefined') {
      // Client-side: use browser storage as fallback
      return;
    }

    try {
      // Server-side: connect to Redis
      const Redis = require('ioredis');
      this.client = new Redis({
        host: this.config.host,
        port: this.config.port,
        password: this.config.password,
        db: this.config.db,
        keyPrefix: this.config.keyPrefix,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
      });

      this.client.on('error', (error: Error) => {
        console.error('Redis connection error:', error);
      });

      this.client.on('connect', () => {
        console.log('Connected to Redis');
      });
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
    }
  }

  private getKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const finalTtl = ttl || this.config.ttl.default;

    if (this.client) {
      try {
        await this.client.setex(
          this.getKey(key),
          finalTtl,
          JSON.stringify(value)
        );
      } catch (error) {
        console.error('Redis set error:', error);
      }
    } else {
      // Fallback to localStorage on client-side
      if (typeof window !== 'undefined') {
        const expiry = Date.now() + finalTtl * 1000;
        localStorage.setItem(
          this.getKey(key),
          JSON.stringify({ value, expiry })
        );
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.client) {
      try {
        const result = await this.client.get(this.getKey(key));
        return result ? JSON.parse(result) : null;
      } catch (error) {
        console.error('Redis get error:', error);
        return null;
      }
    } else {
      // Fallback to localStorage on client-side
      if (typeof window !== 'undefined') {
        const item = localStorage.getItem(this.getKey(key));
        if (item) {
          const { value, expiry } = JSON.parse(item);
          if (Date.now() < expiry) {
            return value;
          } else {
            localStorage.removeItem(this.getKey(key));
          }
        }
      }
      return null;
    }
  }

  async del(key: string): Promise<void> {
    if (this.client) {
      try {
        await this.client.del(this.getKey(key));
      } catch (error) {
        console.error('Redis del error:', error);
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.getKey(key));
      }
    }
  }

  async flush(pattern: string): Promise<void> {
    if (this.client) {
      try {
        const keys = await this.client.keys(`${this.getKey(pattern)}*`);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } catch (error) {
        console.error('Redis flush error:', error);
      }
    } else {
      if (typeof window !== 'undefined') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.getKey(pattern))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
    }
  }

  // Cache with automatic refresh
  async cacheWithRefresh<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number,
    refreshThreshold?: number
  ): Promise<T> {
    const cached = await this.get<{ data: T; timestamp: number }>(key);
    const now = Date.now();
    const threshold =
      refreshThreshold || (ttl ? ttl * 0.8 : this.config.ttl.default * 0.8);

    if (cached) {
      // If cache is still fresh, return cached data
      if (now - cached.timestamp < threshold * 1000) {
        return cached.data;
      }

      // If cache is stale but not expired, refresh in background
      if (now - cached.timestamp < (ttl || this.config.ttl.default) * 1000) {
        // Return stale data immediately
        setTimeout(async () => {
          try {
            const freshData = await fetcher();
            await this.set(
              key,
              { data: freshData, timestamp: Date.now() },
              ttl
            );
          } catch (error) {
            console.error('Background refresh failed:', error);
          }
        }, 0);

        return cached.data;
      }
    }

    // Cache miss or expired, fetch fresh data
    const freshData = await fetcher();
    await this.set(key, { data: freshData, timestamp: now }, ttl);
    return freshData;
  }

  // Get cache stats
  async getStats(): Promise<{
    keyCount: number;
    memoryUsage: number;
    hitRate: number;
  }> {
    if (this.client) {
      try {
        const info = await this.client.info('memory');
        const keyspace = await this.client.info('keyspace');

        // Parse Redis info (simplified)
        const memoryMatch = info.match(/used_memory:(\d+)/);
        const memoryUsage = memoryMatch ? parseInt(memoryMatch[1]) : 0;

        const keyCountMatch = keyspace.match(/keys=(\d+)/);
        const keyCount = keyCountMatch ? parseInt(keyCountMatch[1]) : 0;

        return {
          keyCount,
          memoryUsage,
          hitRate: 0, // Would need to track hits/misses separately
        };
      } catch (error) {
        console.error('Failed to get Redis stats:', error);
      }
    }

    return {
      keyCount: 0,
      memoryUsage: 0,
      hitRate: 0,
    };
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }
}
