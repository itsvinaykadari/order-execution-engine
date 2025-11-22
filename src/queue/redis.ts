import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';

class RedisClient {
  private client: Redis;
  private bullmqClient: Redis;
  private static instance: RedisClient;

  private constructor() {
    // Regular Redis client for general use
    this.client = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    // Separate Redis client for BullMQ (requires maxRetriesPerRequest: null)
    this.bullmqClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    this.client.on('connect', () => {
      logger.info('Redis client connected');
    });

    this.client.on('error', (err: Error) => {
      logger.error({ err }, 'Redis client error');
    });

    this.client.on('ready', () => {
      logger.info('Redis client ready');
    });
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public getClient(): Redis {
    return this.client;
  }

  public getBullMQClient(): Redis {
    return this.bullmqClient;
  }

  public async close(): Promise<void> {
    await this.client.quit();
    await this.bullmqClient.quit();
    logger.info('Redis connection closed');
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      logger.error({ error }, 'Redis health check failed');
      return false;
    }
  }
}

export const redisClient = RedisClient.getInstance();
