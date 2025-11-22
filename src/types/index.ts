export enum OrderStatus {
  PENDING = 'pending',
  ROUTING = 'routing',
  BUILDING = 'building',
  SUBMITTED = 'submitted',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

export enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit',
  SNIPER = 'sniper',
}

export enum DexType {
  RAYDIUM = 'raydium',
  METEORA = 'meteora',
}

export interface Order {
  id: string;
  userId: string;
  orderType: OrderType;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOut?: number;
  selectedDex?: DexType;
  status: OrderStatus;
  txHash?: string;
  executedPrice?: number;
  failureReason?: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderRequest {
  userId: string;
  orderType: OrderType;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
}

export interface DexQuote {
  dex: DexType;
  price: number;
  fee: number;
  estimatedOutput: number;
}

export interface SwapResult {
  txHash: string;
  executedPrice: number;
  amountOut: number;
}

export interface WebSocketMessage {
  orderId: string;
  status: OrderStatus;
  data?: {
    selectedDex?: DexType;
    txHash?: string;
    executedPrice?: number;
    amountOut?: number;
    failureReason?: string;
  };
  timestamp: string;
}
