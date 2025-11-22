import { buildServer } from '../../src/app';
import { FastifyInstance } from 'fastify';

describe('Order Routes', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await buildServer();
  });

  afterAll(async () => {
    await server.close();
  });

  describe('POST /api/orders/execute', () => {
    it('should accept a valid market order', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/orders/execute',
        payload: {
          userId: 'test-user-1',
          orderType: 'market',
          tokenIn: 'SOL',
          tokenOut: 'USDC',
          amountIn: 100,
        },
      });

      expect(response.statusCode).toBe(202);
      const body = JSON.parse(response.body);
      
      expect(body).toHaveProperty('orderId');
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('websocketUrl');
      expect(body.status).toBe('pending');
    });

    it('should reject order with missing fields', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/orders/execute',
        payload: {
          userId: 'test-user-1',
          tokenIn: 'SOL',
          // Missing tokenOut and amountIn
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
    });

    it('should reject order with invalid amount', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/orders/execute',
        payload: {
          userId: 'test-user-1',
          orderType: 'market',
          tokenIn: 'SOL',
          tokenOut: 'USDC',
          amountIn: -10,
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('greater than 0');
    });

    it('should reject order with invalid order type', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/orders/execute',
        payload: {
          userId: 'test-user-1',
          orderType: 'invalid',
          tokenIn: 'SOL',
          tokenOut: 'USDC',
          amountIn: 100,
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('Invalid orderType');
    });
  });

  describe('GET /api/orders/:orderId', () => {
    it('should return 404 for non-existent order', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/orders/00000000-0000-0000-0000-000000000000',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/orders', () => {
    it('should require userId query parameter', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/orders',
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('userId');
    });

    it('should return orders for a user', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/orders?userId=test-user-1',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      expect(body).toHaveProperty('userId');
      expect(body).toHaveProperty('count');
      expect(body).toHaveProperty('orders');
      expect(Array.isArray(body.orders)).toBe(true);
    });
  });
});
