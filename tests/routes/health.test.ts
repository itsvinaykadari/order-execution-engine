import { buildServer } from '../../src/app';
import { FastifyInstance } from 'fastify';

describe('Health Routes', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await buildServer();
  });

  afterAll(async () => {
    await server.close();
  });

  it('should return health status', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('services');
    expect(body.services).toHaveProperty('database');
    expect(body.services).toHaveProperty('redis');
  });
});
