import { Worker, Job } from 'bullmq';
import { redisClient } from '../queue/redis';
import { OrderJobData } from '../queue/orderQueue';
import { orderModel } from '../models/Order';
import { DexRouter } from '../dex/DexRouter';
import { OrderStatus } from '../types';
import { wsManager } from '../websocket/manager';
import { logger } from '../utils/logger';
import { config } from '../config';

export class OrderWorker {
  private worker: Worker<OrderJobData>;
  private dexRouter: DexRouter;

  constructor() {
    this.dexRouter = new DexRouter();

    this.worker = new Worker<OrderJobData>(
      'order-execution',
      async (job: Job<OrderJobData>) => this.processOrder(job),
      {
        connection: redisClient.getClient(),
        concurrency: config.queueConcurrency,
        limiter: {
          max: 100, // Max 100 jobs
          duration: 60000, // per minute
        },
      }
    );

    this.setupEventHandlers();
    logger.info({ concurrency: config.queueConcurrency }, 'Order worker initialized');
  }

  private async processOrder(job: Job<OrderJobData>): Promise<void> {
    const { orderId, tokenIn, tokenOut, amountIn } = job.data;
    const attemptNumber = job.attemptsMade + 1;

    logger.info({
      orderId,
      attemptNumber,
      tokenIn,
      tokenOut,
      amountIn,
    }, 'Processing order');

    try {
      // Step 1: Mark as routing
      await orderModel.updateStatus(orderId, OrderStatus.ROUTING);
      wsManager.emitOrderUpdate(orderId, OrderStatus.ROUTING);

      // Step 2: Get best DEX quote
      const bestQuote = await this.dexRouter.getBestQuote(tokenIn, tokenOut, amountIn);
      
      logger.info({
        orderId,
        selectedDex: bestQuote.dex,
        estimatedOutput: bestQuote.estimatedOutput,
      }, 'DEX routing completed');

      // Step 3: Mark as building transaction
      await orderModel.updateStatus(orderId, OrderStatus.BUILDING, {
        selectedDex: bestQuote.dex,
      });
      wsManager.emitOrderUpdate(orderId, OrderStatus.BUILDING, {
        selectedDex: bestQuote.dex,
      });

      // Step 4: Execute swap
      const minAmountOut = bestQuote.estimatedOutput * 0.98; // 2% slippage tolerance
      
      await orderModel.updateStatus(orderId, OrderStatus.SUBMITTED, {
        selectedDex: bestQuote.dex,
      });
      wsManager.emitOrderUpdate(orderId, OrderStatus.SUBMITTED, {
        selectedDex: bestQuote.dex,
      });

      const swapResult = await this.dexRouter.executeSwap(
        bestQuote.dex,
        tokenIn,
        tokenOut,
        amountIn,
        minAmountOut
      );

      // Step 5: Mark as confirmed
      await orderModel.updateStatus(orderId, OrderStatus.CONFIRMED, {
        selectedDex: bestQuote.dex,
        txHash: swapResult.txHash,
        executedPrice: swapResult.executedPrice,
        amountOut: swapResult.amountOut,
      });

      wsManager.emitOrderUpdate(orderId, OrderStatus.CONFIRMED, {
        selectedDex: bestQuote.dex,
        txHash: swapResult.txHash,
        executedPrice: swapResult.executedPrice,
        amountOut: swapResult.amountOut,
      });

      logger.info({
        orderId,
        txHash: swapResult.txHash,
        executedPrice: swapResult.executedPrice,
        amountOut: swapResult.amountOut,
      }, 'Order executed successfully');

    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      
      logger.error({
        error,
        orderId,
        attemptNumber,
        maxAttempts: config.maxRetryAttempts,
      }, 'Order processing failed');

      // If this is the last attempt, mark as failed
      if (attemptNumber >= config.maxRetryAttempts) {
        await orderModel.updateStatus(orderId, OrderStatus.FAILED, {
          failureReason: errorMessage,
          retryCount: attemptNumber,
        });

        wsManager.emitOrderUpdate(orderId, OrderStatus.FAILED, {
          failureReason: errorMessage,
        });

        logger.error({ orderId, errorMessage }, 'Order failed after all retries');
      } else {
        // Update retry count for next attempt
        await orderModel.updateStatus(orderId, OrderStatus.PENDING, {
          retryCount: attemptNumber,
        });
        
        logger.info({ orderId, attemptNumber }, 'Order will be retried');
      }

      // Re-throw to trigger BullMQ retry mechanism
      throw error;
    }
  }

  private setupEventHandlers(): void {
    this.worker.on('completed', (job: Job<OrderJobData>) => {
      logger.info({ jobId: job.id, orderId: job.data.orderId }, 'Job completed');
    });

    this.worker.on('failed', (job: Job<OrderJobData> | undefined, error: Error) => {
      if (job) {
        logger.error({
          jobId: job.id,
          orderId: job.data.orderId,
          error: error.message,
          attemptsMade: job.attemptsMade,
        }, 'Job failed');
      }
    });

    this.worker.on('error', (error: Error) => {
      logger.error({ error }, 'Worker error');
    });
  }

  public async close(): Promise<void> {
    await this.worker.close();
    logger.info('Order worker closed');
  }
}
