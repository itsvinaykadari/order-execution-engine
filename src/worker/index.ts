import { database } from '../database/connection';
import { redisClient } from '../queue/redis';
import { OrderWorker } from './orderWorker';
import { logger } from '../utils/logger';

async function startWorker(): Promise<void> {
  try {
    logger.info('Starting order worker...');

    // Check database connection
    const dbHealthy = await database.healthCheck();
    if (!dbHealthy) {
      throw new Error('Database connection failed');
    }

    // Check Redis connection
    const redisHealthy = await redisClient.healthCheck();
    if (!redisHealthy) {
      throw new Error('Redis connection failed');
    }

    // Initialize worker
    const worker = new OrderWorker();

    logger.info('Order worker started successfully');

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info({ signal }, 'Shutdown signal received');

      try {
        await worker.close();
        await database.close();
        await redisClient.close();
        logger.info('Worker shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error({ error }, 'Error during shutdown');
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error({ error }, 'Failed to start worker');
    process.exit(1);
  }
}

startWorker();
