import { WebSocket } from 'ws';
import { OrderStatus, DexType, WebSocketMessage } from '../types';
import { logger } from '../utils/logger';

interface SubscriptionMap {
  [orderId: string]: Set<WebSocket>;
}

export class WebSocketManager {
  private subscriptions: SubscriptionMap = {};
  private static instance: WebSocketManager;

  private constructor() {}

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public subscribe(orderId: string, ws: WebSocket): void {
    if (!this.subscriptions[orderId]) {
      this.subscriptions[orderId] = new Set();
    }
    this.subscriptions[orderId].add(ws);

    logger.debug({ orderId, subscriberCount: this.subscriptions[orderId].size }, 'WebSocket subscribed to order');
  }

  public unsubscribe(orderId: string, ws: WebSocket): void {
    if (this.subscriptions[orderId]) {
      this.subscriptions[orderId].delete(ws);
      
      if (this.subscriptions[orderId].size === 0) {
        delete this.subscriptions[orderId];
      }

      logger.debug({ orderId }, 'WebSocket unsubscribed from order');
    }
  }

  public emitOrderUpdate(
    orderId: string,
    status: OrderStatus,
    data?: {
      selectedDex?: DexType;
      txHash?: string;
      executedPrice?: number;
      amountOut?: number;
      failureReason?: string;
    }
  ): void {
    const message: WebSocketMessage = {
      orderId,
      status,
      data,
      timestamp: new Date().toISOString(),
    };

    const subscribers = this.subscriptions[orderId];
    
    if (!subscribers || subscribers.size === 0) {
      logger.debug({ orderId, status }, 'No subscribers for order update');
      return;
    }

    const messageString = JSON.stringify(message);
    let sentCount = 0;

    subscribers.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageString);
        sentCount++;
      } else {
        // Remove dead connections
        this.unsubscribe(orderId, ws);
      }
    });

    logger.info({ orderId, status, sentCount }, 'Order update emitted to subscribers');
  }

  public getSubscriberCount(orderId: string): number {
    return this.subscriptions[orderId]?.size || 0;
  }

  public getTotalSubscribers(): number {
    return Object.values(this.subscriptions).reduce((sum, set) => sum + set.size, 0);
  }
}

export const wsManager = WebSocketManager.getInstance();
