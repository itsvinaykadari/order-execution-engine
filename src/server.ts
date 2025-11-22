import { database } from './database/connection';
import { redisClient } from './queue/redis';
import { runMigrations } from './database/migrate';
import { startServer } from './app';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  try {
    logger.info('Starting Order Execution Engine...');

    // Check database connection
    const dbHealthy = await database.healthCheck();
    if (!dbHealthy) {
      throw new Error('Database connection failed');
    }
    logger.info('Database connection established');

    // Run migrations
    await runMigrations();

    // Check Redis connection
    const redisHealthy = await redisClient.healthCheck();
    if (!redisHealthy) {
      throw new Error('Redis connection failed');
    }
    logger.info('Redis connection established');

    // Start server
    const server = await startServer();

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info({ signal }, 'Shutdown signal received');

      try {
        await server.close();
        await database.close();
        await redisClient.close();
        logger.info('Server shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error({ error }, 'Error during shutdown');
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

bootstrap();
