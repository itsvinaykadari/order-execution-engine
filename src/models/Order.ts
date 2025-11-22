import { database } from '../database/connection';
import { Order, OrderStatus, OrderType, CreateOrderRequest, DexType } from '../types';
import { logger } from '../utils/logger';

export class OrderModel {
  async create(orderData: CreateOrderRequest): Promise<Order> {
    const query = `
      INSERT INTO orders (user_id, order_type, token_in, token_out, amount_in, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      orderData.userId,
      orderData.orderType,
      orderData.tokenIn,
      orderData.tokenOut,
      orderData.amountIn,
      OrderStatus.PENDING,
    ];

    try {
      const result = await database.query(query, values);
      return this.mapRowToOrder(result.rows[0]);
    } catch (error) {
      logger.error({ error, orderData }, 'Failed to create order');
      throw error;
    }
  }

  async findById(orderId: string): Promise<Order | null> {
    const query = 'SELECT * FROM orders WHERE id = $1';
    
    try {
      const result = await database.query(query, [orderId]);
      return result.rows.length > 0 ? this.mapRowToOrder(result.rows[0]) : null;
    } catch (error) {
      logger.error({ error, orderId }, 'Failed to find order');
      throw error;
    }
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    data?: {
      selectedDex?: DexType;
      txHash?: string;
      executedPrice?: number;
      amountOut?: number;
      failureReason?: string;
      retryCount?: number;
    }
  ): Promise<Order> {
    const updates: string[] = ['status = $2'];
    const values: any[] = [orderId, status];
    let paramIndex = 3;

    if (data?.selectedDex) {
      updates.push(`selected_dex = $${paramIndex++}`);
      values.push(data.selectedDex);
    }

    if (data?.txHash) {
      updates.push(`tx_hash = $${paramIndex++}`);
      values.push(data.txHash);
    }

    if (data?.executedPrice !== undefined) {
      updates.push(`executed_price = $${paramIndex++}`);
      values.push(data.executedPrice);
    }

    if (data?.amountOut !== undefined) {
      updates.push(`amount_out = $${paramIndex++}`);
      values.push(data.amountOut);
    }

    if (data?.failureReason) {
      updates.push(`failure_reason = $${paramIndex++}`);
      values.push(data.failureReason);
    }

    if (data?.retryCount !== undefined) {
      updates.push(`retry_count = $${paramIndex++}`);
      values.push(data.retryCount);
    }

    const query = `
      UPDATE orders
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await database.query(query, values);
      return this.mapRowToOrder(result.rows[0]);
    } catch (error) {
      logger.error({ error, orderId, status }, 'Failed to update order status');
      throw error;
    }
  }

  async findRecentOrders(userId: string, limit = 50): Promise<Order[]> {
    const query = `
      SELECT * FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    try {
      const result = await database.query(query, [userId, limit]);
      return result.rows.map((row: any) => this.mapRowToOrder(row));
    } catch (error) {
      logger.error({ error, userId }, 'Failed to fetch recent orders');
      throw error;
    }
  }

  private mapRowToOrder(row: any): Order {
    return {
      id: row.id,
      userId: row.user_id,
      orderType: row.order_type as OrderType,
      tokenIn: row.token_in,
      tokenOut: row.token_out,
      amountIn: parseFloat(row.amount_in),
      amountOut: row.amount_out ? parseFloat(row.amount_out) : undefined,
      selectedDex: row.selected_dex as DexType | undefined,
      status: row.status as OrderStatus,
      txHash: row.tx_hash,
      executedPrice: row.executed_price ? parseFloat(row.executed_price) : undefined,
      failureReason: row.failure_reason,
      retryCount: row.retry_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export const orderModel = new OrderModel();
