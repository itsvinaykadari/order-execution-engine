import { WebSocketManager } from '../../src/websocket/manager';
import { OrderStatus, DexType } from '../../src/types';
import { WebSocket } from 'ws';

describe('WebSocketManager', () => {
  let wsManager: WebSocketManager;
  let mockWs: any;

  beforeEach(() => {
    wsManager = WebSocketManager.getInstance();
    
    // Create mock WebSocket
    mockWs = {
      readyState: WebSocket.OPEN,
      send: jest.fn(),
    };
  });

  it('should subscribe a WebSocket to an order', () => {
    const orderId = 'test-order-1';
    
    wsManager.subscribe(orderId, mockWs as WebSocket);
    
    expect(wsManager.getSubscriberCount(orderId)).toBe(1);
  });

  it('should unsubscribe a WebSocket from an order', () => {
    const orderId = 'test-order-2';
    
    wsManager.subscribe(orderId, mockWs as WebSocket);
    expect(wsManager.getSubscriberCount(orderId)).toBe(1);
    
    wsManager.unsubscribe(orderId, mockWs as WebSocket);
    expect(wsManager.getSubscriberCount(orderId)).toBe(0);
  });

  it('should emit order updates to subscribers', () => {
    const orderId = 'test-order-3';
    
    wsManager.subscribe(orderId, mockWs as WebSocket);
    
    wsManager.emitOrderUpdate(orderId, OrderStatus.ROUTING);
    
    expect(mockWs.send).toHaveBeenCalled();
    const sentMessage = JSON.parse(mockWs.send.mock.calls[0][0]);
    
    expect(sentMessage.orderId).toBe(orderId);
    expect(sentMessage.status).toBe(OrderStatus.ROUTING);
    expect(sentMessage).toHaveProperty('timestamp');
  });

  it('should emit updates with additional data', () => {
    const orderId = 'test-order-4';
    
    wsManager.subscribe(orderId, mockWs as WebSocket);
    
    wsManager.emitOrderUpdate(orderId, OrderStatus.CONFIRMED, {
      selectedDex: DexType.RAYDIUM,
      txHash: 'abc123',
      executedPrice: 1.5,
      amountOut: 150,
    });
    
    expect(mockWs.send).toHaveBeenCalled();
    const sentMessage = JSON.parse(mockWs.send.mock.calls[0][0]);
    
    expect(sentMessage.data.selectedDex).toBe(DexType.RAYDIUM);
    expect(sentMessage.data.txHash).toBe('abc123');
    expect(sentMessage.data.executedPrice).toBe(1.5);
  });

  it('should handle multiple subscribers for the same order', () => {
    const orderId = 'test-order-5';
    const mockWs2 = {
      readyState: WebSocket.OPEN,
      send: jest.fn(),
    };
    
    wsManager.subscribe(orderId, mockWs as WebSocket);
    wsManager.subscribe(orderId, mockWs2 as any);
    
    expect(wsManager.getSubscriberCount(orderId)).toBe(2);
    
    wsManager.emitOrderUpdate(orderId, OrderStatus.BUILDING);
    
    expect(mockWs.send).toHaveBeenCalled();
    expect(mockWs2.send).toHaveBeenCalled();
  });

  it('should not send to closed WebSocket connections', () => {
    const orderId = 'test-order-6';
    mockWs.readyState = WebSocket.CLOSED;
    
    wsManager.subscribe(orderId, mockWs as WebSocket);
    wsManager.emitOrderUpdate(orderId, OrderStatus.ROUTING);
    
    expect(mockWs.send).not.toHaveBeenCalled();
    expect(wsManager.getSubscriberCount(orderId)).toBe(0);
  });
});
