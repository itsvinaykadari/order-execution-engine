import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { orderModel } from '../models/Order';
import { orderQueue } from '../queue/orderQueue';
import { OrderType, CreateOrderRequest } from '../types';
import { logger } from '../utils/logger';

interface CreateOrderBody {
  userId: string;
  orderType?: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
}

interface GetOrdersQuery {
  userId?: string;
  limit?: string;
}

export async function orderRoutes(server: FastifyInstance): Promise<void> {
  // POST /api/orders/execute - Submit order for execution
  server.post('/execute', async (request: FastifyRequest<{ Body: CreateOrderBody }>, reply: FastifyReply) => {
    try {
      const { userId, orderType = 'market', tokenIn, tokenOut, amountIn } = request.body;

      // Validation
      if (!userId || !tokenIn || !tokenOut || !amountIn) {
        return reply.code(400).send({
          error: 'Missing required fields: userId, tokenIn, tokenOut, amountIn',
        });
      }

      if (amountIn <= 0) {
        return reply.code(400).send({
          error: 'amountIn must be greater than 0',
        });
      }

      if (!Object.values(OrderType).includes(orderType as OrderType)) {
        return reply.code(400).send({
          error: `Invalid orderType. Must be one of: ${Object.values(OrderType).join(', ')}`,
        });
      }

      // Create order in database
      const orderData: CreateOrderRequest = {
        userId,
        orderType: orderType as OrderType,
        tokenIn,
        tokenOut,
        amountIn,
      };

      const order = await orderModel.create(orderData);

      // Add to queue
      await orderQueue.addOrder({
        orderId: order.id,
        userId: order.userId,
        orderType: order.orderType,
        tokenIn: order.tokenIn,
        tokenOut: order.tokenOut,
        amountIn: order.amountIn,
      });

      logger.info({ orderId: order.id, userId }, 'Order created and queued');

      // Return 202 Accepted with order ID
      reply.code(202).send({
        orderId: order.id,
        status: order.status,
        message: 'Order accepted and queued for execution. Connect to WebSocket for status updates.',
        websocketUrl: `/ws/orders/${order.id}`,
      });

    } catch (error: any) {
      logger.error({ error }, 'Failed to create order');
      reply.code(500).send({
        error: 'Internal server error',
        message: error.message,
      });
    }
  });

  // GET /api/orders/:orderId - Get order details
  server.get('/:orderId', async (request: FastifyRequest<{ Params: { orderId: string } }>, reply: FastifyReply) => {
    try {
      const { orderId } = request.params;

      const order = await orderModel.findById(orderId);

      if (!order) {
        return reply.code(404).send({
          error: 'Order not found',
        });
      }

      reply.send(order);
    } catch (error: any) {
      logger.error({ error }, 'Failed to fetch order');
      reply.code(500).send({
        error: 'Internal server error',
        message: error.message,
      });
    }
  });

  // GET /api/orders - Get recent orders for a user
  server.get('/', async (request: FastifyRequest<{ Querystring: GetOrdersQuery }>, reply: FastifyReply) => {
    try {
      const { userId, limit = '50' } = request.query;

      if (!userId) {
        return reply.code(400).send({
          error: 'Missing required query parameter: userId',
        });
      }

      const orders = await orderModel.findRecentOrders(userId, parseInt(limit, 10));

      reply.send({
        userId,
        count: orders.length,
        orders,
      });
    } catch (error: any) {
      logger.error({ error }, 'Failed to fetch orders');
      reply.code(500).send({
        error: 'Internal server error',
        message: error.message,
      });
    }
  });
}
