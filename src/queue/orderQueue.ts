import { Queue, QueueOptions } from 'bullmq';
import { redisClient } from './redis';
import { logger } from '../utils/logger';
import { config } from '../config';

export interface OrderJobData {
  orderId: string;
  userId: string;
  orderType: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
}

const queueOptions: QueueOptions = {
  connection: redisClient.getBullMQClient(),
  defaultJobOptions: {
    attempts: config.maxRetryAttempts,
    backoff: {
      type: 'exponential',
      delay: 1000, // Start with 1 second
    },
    removeOnComplete: {
      count: 1000, // Keep last 1000 completed jobs
      age: 24 * 3600, // Keep for 24 hours
    },
    removeOnFail: {
      count: 5000, // Keep last 5000 failed jobs
      age: 7 * 24 * 3600, // Keep for 7 days
    },
  },
};

export class OrderQueue {
  private queue: Queue<OrderJobData>;
  private static instance: OrderQueue;

  private constructor() {
    this.queue = new Queue<OrderJobData>('order-execution', queueOptions);

    this.queue.on('error', (error: Error) => {
      logger.error({ error }, 'Order queue error');
    });

    logger.info('Order queue initialized');
  }

  public static getInstance(): OrderQueue {
    if (!OrderQueue.instance) {
      OrderQueue.instance = new OrderQueue();
    }
    return OrderQueue.instance;
  }

  public async addOrder(orderData: OrderJobData): Promise<string> {
    try {
      const job = await this.queue.add('execute-order', orderData, {
        jobId: orderData.orderId,
      });

      logger.info({ jobId: job.id, orderId: orderData.orderId }, 'Order added to queue');
      return job.id!;
    } catch (error) {
      logger.error({ error, orderData }, 'Failed to add order to queue');
      throw error;
    }
  }

  public getQueue(): Queue<OrderJobData> {
    return this.queue;
  }

  public async close(): Promise<void> {
    await this.queue.close();
    logger.info('Order queue closed');
  }

  public async getJobCounts(): Promise<any> {
    return await this.queue.getJobCounts();
  }
}

export const orderQueue = OrderQueue.getInstance();
