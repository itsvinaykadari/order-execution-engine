import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { database } from '../database/connection';
import { redisClient } from '../queue/redis';
import { orderQueue } from '../queue/orderQueue';

export async function healthRoutes(server: FastifyInstance): Promise<void> {
  server.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const dbHealthy = await database.healthCheck();
      const redisHealthy = await redisClient.healthCheck();
      const queueCounts = await orderQueue.getJobCounts();

      const healthy = dbHealthy && redisHealthy;

      reply.code(healthy ? 200 : 503).send({
        status: healthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: dbHealthy ? 'up' : 'down',
          redis: redisHealthy ? 'up' : 'down',
        },
        queue: queueCounts,
      });
    } catch (error: any) {
      reply.code(503).send({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  });
}
