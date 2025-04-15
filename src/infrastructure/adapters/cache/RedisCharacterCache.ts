import { createClient } from 'redis';
import { Character } from '../../../domain/entities/Character';
import { ICharacterCache } from '../../../domain/ports/cache/ICharacterCache';

export class RedisCharacterCache implements ICharacterCache {
  private readonly client;
  private readonly ttl = 1800; // 30 minutes in seconds

  constructor() {
    const defaultUrl = 'redis://localhost:6379';
    const redisUrl = process.env.REDIS_URL || defaultUrl;
    const isAws = redisUrl.includes('.amazonaws.com');
    
    this.client = createClient({
      url: isAws ? `rediss://${redisUrl}` : redisUrl,
      socket: isAws ? {
        tls: true,
        rejectUnauthorized: false,
        connectTimeout: 10000, // 10 seconds
        keepAlive: 5000, // 5 seconds
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            console.error('Max reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          return Math.min(retries * 100, 3000);
        }
      } : undefined
    });

    // Event listeners for better error handling
    this.client.on('error', (err) => console.error('Redis Client Error:', err));
    this.client.on('connect', () => console.log('Redis Client Connected'));
    this.client.on('reconnecting', () => console.log('Redis Client Reconnecting...'));

    // Connect with error handling
    this.connect();
  }

  private async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      // Optionally implement a fallback mechanism here
    }
  }

  private getKey(id: string): string {
    return `character:${id}`;
  }

  private getListKey(page: number): string {
    return `characters:page:${page}`;
  }

  async get(id: string): Promise<Character | null> {
    try {
      if (!this.client.isOpen) {
        console.warn('Redis connection is not open, skipping cache get');
        return null;
      }

      const data = await this.client.get(this.getKey(id));
      if (!data) return null;

      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting character from cache:', error);
      return null;
    }
  }

  async set(id: string, character: Character, ttlSeconds: number = this.ttl): Promise<void> {
    try {
      if (!this.client.isOpen) {
        console.warn('Redis connection is not open, skipping cache set');
        return;
      }

      await this.client.setEx(
        this.getKey(id),
        ttlSeconds,
        JSON.stringify(character)
      );
    } catch (error) {
      console.error('Error setting character in cache:', error);
      // Silently fail - the application can continue without cache
    }
  }

  async getList(page: number): Promise<Character[] | null> {
    try {
      if (!this.client.isOpen) {
        console.warn('Redis connection is not open, skipping cache get list');
        return null;
      }

      const data = await this.client.get(this.getListKey(page));
      if (!data) return null;

      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting character list from cache:', error);
      return null;
    }
  }

  async setList(page: number, characters: Character[], ttlSeconds: number = this.ttl): Promise<void> {
    try {
      if (!this.client.isOpen) {
        console.warn('Redis connection is not open, skipping cache set list');
        return;
      }

      await this.client.setEx(
        this.getListKey(page),
        ttlSeconds,
        JSON.stringify(characters)
      );
    } catch (error) {
      console.error('Error setting character list in cache:', error);
      // Silently fail - the application can continue without cache
    }
  }
}
