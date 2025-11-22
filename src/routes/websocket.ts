import { FastifyInstance, FastifyRequest } from 'fastify';
import { wsManager } from '../websocket/manager';
import { orderModel } from '../models/Order';
import { logger } from '../utils/logger';

interface WebSocketParams {
  orderId: string;
}

export async function websocketHandler(server: FastifyInstance): Promise<void> {
  server.get(
    '/orders/:orderId',
    { websocket: true },
    async (connection: any, request: FastifyRequest<{ Params: WebSocketParams }>) => {
      const { orderId } = request.params;
      const ws = connection.socket;

      logger.info({ orderId, remoteAddress: request.ip }, 'WebSocket connection established');

      // Verify order exists
      try {
        const order = await orderModel.findById(orderId);
        
        if (!order) {
          ws.send(JSON.stringify({
            error: 'Order not found',
            orderId,
          }));
          ws.close();
          return;
        }

        // Subscribe to order updates
        wsManager.subscribe(orderId, ws);

        // Send current order status immediately
        ws.send(JSON.stringify({
          orderId: order.id,
          status: order.status,
          data: {
            selectedDex: order.selectedDex,
            txHash: order.txHash,
            executedPrice: order.executedPrice,
            amountOut: order.amountOut,
            failureReason: order.failureReason,
          },
          timestamp: new Date().toISOString(),
        }));

        // Handle connection close
        ws.on('close', () => {
          wsManager.unsubscribe(orderId, ws);
          logger.info({ orderId }, 'WebSocket connection closed');
        });

        // Handle errors
        ws.on('error', (error: Error) => {
          logger.error({ error, orderId }, 'WebSocket error');
          wsManager.unsubscribe(orderId, ws);
        });

        // Handle incoming messages (ping/pong for keep-alive)
        ws.on('message', (message: any) => {
          try {
            const data = JSON.parse(message.toString());
            
            if (data.type === 'ping') {
              ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
            }
          } catch (error) {
            logger.error({ error, orderId }, 'Failed to parse WebSocket message');
          }
        });

      } catch (error: any) {
        logger.error({ error, orderId }, 'Failed to establish WebSocket connection');
        ws.send(JSON.stringify({
          error: 'Internal server error',
          message: error.message,
        }));
        ws.close();
      }
    }
  );
}
