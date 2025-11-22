import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://orderuser:orderpass@localhost:5432/orderdb',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // Queue
  queueConcurrency: parseInt(process.env.QUEUE_CONCURRENCY || '10', 10),
  maxRetryAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3', 10),

  // DEX Mock Settings
  mockDexEnabled: process.env.MOCK_DEX_ENABLED === 'true',
  raydiumDelayMs: parseInt(process.env.RAYDIUM_DELAY_MS || '200', 10),
  meteoraDelayMs: parseInt(process.env.METEORA_DELAY_MS || '200', 10),
  swapDelayMs: parseInt(process.env.SWAP_DELAY_MS || '2500', 10),
  failureRate: parseFloat(process.env.FAILURE_RATE || '0.05'),

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};
