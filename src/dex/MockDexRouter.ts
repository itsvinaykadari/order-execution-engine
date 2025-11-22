import { DexQuote, DexType, SwapResult } from '../types';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface IDexRouter {
  getQuote(tokenIn: string, tokenOut: string, amountIn: number): Promise<DexQuote>;
  executeSwap(tokenIn: string, tokenOut: string, amountIn: number, minAmountOut: number): Promise<SwapResult>;
}

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export class MockRaydiumRouter implements IDexRouter {
  private dexType = DexType.RAYDIUM;
  private baseFee = 0.003; // 0.3% fee

  async getQuote(tokenIn: string, tokenOut: string, amountIn: number): Promise<DexQuote> {
    // Simulate network delay
    await sleep(config.raydiumDelayMs);

    // Simulate base price with some variance (±2%)
    const basePrice = this.calculateBasePrice(tokenIn, tokenOut);
    const priceVariance = 0.98 + Math.random() * 0.04;
    const price = basePrice * priceVariance;

    const estimatedOutput = amountIn * price * (1 - this.baseFee);

    logger.debug({
      dex: this.dexType,
      tokenIn,
      tokenOut,
      amountIn,
      price,
      estimatedOutput,
    }, 'Raydium quote fetched');

    return {
      dex: this.dexType,
      price,
      fee: this.baseFee,
      estimatedOutput,
    };
  }

  async executeSwap(
    tokenIn: string,
    tokenOut: string,
    amountIn: number,
    minAmountOut: number
  ): Promise<SwapResult> {
    // Simulate 2-3 second execution time
    const executionDelay = config.swapDelayMs + Math.random() * 1000;
    await sleep(executionDelay);

    // Simulate occasional failures
    if (Math.random() < config.failureRate) {
      throw new Error('Raydium: Swap execution failed - insufficient liquidity');
    }

    const basePrice = this.calculateBasePrice(tokenIn, tokenOut);
    const executedPrice = basePrice * (0.99 + Math.random() * 0.02);
    const amountOut = amountIn * executedPrice * (1 - this.baseFee);

    // Check slippage
    if (amountOut < minAmountOut) {
      throw new Error('Raydium: Slippage tolerance exceeded');
    }

    const txHash = this.generateMockTxHash();

    logger.info({
      dex: this.dexType,
      txHash,
      tokenIn,
      tokenOut,
      amountIn,
      amountOut,
      executedPrice,
    }, 'Raydium swap executed');

    return {
      txHash,
      executedPrice,
      amountOut,
    };
  }

  private calculateBasePrice(tokenIn: string, tokenOut: string): number {
    // Mock price calculation based on token pair
    // In real implementation, this would fetch from actual pool
    const hash = `${tokenIn}${tokenOut}`.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 1 + (hash % 100) / 100; // Returns price between 1.0 and 2.0
  }

  private generateMockTxHash(): string {
    const chars = 'abcdef0123456789';
    let hash = '';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  }
}

export class MockMeteoraRouter implements IDexRouter {
  private dexType = DexType.METEORA;
  private baseFee = 0.002; // 0.2% fee (slightly lower than Raydium)

  async getQuote(tokenIn: string, tokenOut: string, amountIn: number): Promise<DexQuote> {
    // Simulate network delay
    await sleep(config.meteoraDelayMs);

    // Simulate base price with variance (±2.5%)
    const basePrice = this.calculateBasePrice(tokenIn, tokenOut);
    const priceVariance = 0.975 + Math.random() * 0.05;
    const price = basePrice * priceVariance;

    const estimatedOutput = amountIn * price * (1 - this.baseFee);

    logger.debug({
      dex: this.dexType,
      tokenIn,
      tokenOut,
      amountIn,
      price,
      estimatedOutput,
    }, 'Meteora quote fetched');

    return {
      dex: this.dexType,
      price,
      fee: this.baseFee,
      estimatedOutput,
    };
  }

  async executeSwap(
    tokenIn: string,
    tokenOut: string,
    amountIn: number,
    minAmountOut: number
  ): Promise<SwapResult> {
    // Simulate 2-3 second execution time
    const executionDelay = config.swapDelayMs + Math.random() * 1000;
    await sleep(executionDelay);

    // Simulate occasional failures
    if (Math.random() < config.failureRate) {
      throw new Error('Meteora: Swap execution failed - pool reserves depleted');
    }

    const basePrice = this.calculateBasePrice(tokenIn, tokenOut);
    const executedPrice = basePrice * (0.985 + Math.random() * 0.03);
    const amountOut = amountIn * executedPrice * (1 - this.baseFee);

    // Check slippage
    if (amountOut < minAmountOut) {
      throw new Error('Meteora: Slippage tolerance exceeded');
    }

    const txHash = this.generateMockTxHash();

    logger.info({
      dex: this.dexType,
      txHash,
      tokenIn,
      tokenOut,
      amountIn,
      amountOut,
      executedPrice,
    }, 'Meteora swap executed');

    return {
      txHash,
      executedPrice,
      amountOut,
    };
  }

  private calculateBasePrice(tokenIn: string, tokenOut: string): number {
    // Mock price calculation - Meteora typically has slightly better prices
    const hash = `${tokenIn}${tokenOut}`.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 1.02 + (hash % 100) / 100; // Returns price between 1.02 and 2.02
  }

  private generateMockTxHash(): string {
    const chars = 'abcdef0123456789';
    let hash = '';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  }
}
