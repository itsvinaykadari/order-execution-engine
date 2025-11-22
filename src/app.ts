import Fastify, { FastifyInstance } from 'fastify';
import websocket from '@fastify/websocket';
import { config } from './config';
import { logger } from './utils/logger';
import { orderRoutes } from './routes/orders';
import { healthRoutes } from './routes/health';
import { websocketHandler } from './routes/websocket';

export async function buildServer(): Promise<FastifyInstance> {
  const server = Fastify({
    logger: logger as any,
    trustProxy: true,
  });

  // Register WebSocket plugin
  await server.register(websocket);

  // Register routes
  await server.register(healthRoutes, { prefix: '/health' });
  await server.register(orderRoutes, { prefix: '/api/orders' });
  await server.register(websocketHandler, { prefix: '/ws' });

  return server;
}

export async function startServer(): Promise<FastifyInstance> {
  try {
    const server = await buildServer();

    await server.listen({
      port: config.port,
      host: '0.0.0.0',
    });

    logger.info(`Server listening on port ${config.port}`);
    return server;
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    throw error;
  }
}
