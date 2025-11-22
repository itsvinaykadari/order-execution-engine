import { DexQuote, DexType, SwapResult } from '../types';
import { MockRaydiumRouter, MockMeteoraRouter, IDexRouter } from './MockDexRouter';
import { logger } from '../utils/logger';

export class DexRouter {
  private raydiumRouter: IDexRouter;
  private meteoraRouter: IDexRouter;

  constructor() {
    this.raydiumRouter = new MockRaydiumRouter();
    this.meteoraRouter = new MockMeteoraRouter();
  }

  /**
   * Fetches quotes from both Raydium and Meteora, compares them,
   * and returns the best quote with the highest estimated output
   */
  async getBestQuote(tokenIn: string, tokenOut: string, amountIn: number): Promise<DexQuote> {
    logger.info({ tokenIn, tokenOut, amountIn }, 'Fetching quotes from all DEXs');

    // Fetch quotes from both DEXs in parallel
    const [raydiumQuote, meteoraQuote] = await Promise.all([
      this.raydiumRouter.getQuote(tokenIn, tokenOut, amountIn),
      this.meteoraRouter.getQuote(tokenIn, tokenOut, amountIn),
    ]);

    // Compare and select best quote based on estimated output
    const bestQuote = raydiumQuote.estimatedOutput > meteoraQuote.estimatedOutput
      ? raydiumQuote
      : meteoraQuote;

    logger.info({
      raydiumOutput: raydiumQuote.estimatedOutput,
      meteoraOutput: meteoraQuote.estimatedOutput,
      selectedDex: bestQuote.dex,
      estimatedOutput: bestQuote.estimatedOutput,
    }, 'Best DEX selected');

    return bestQuote;
  }

  /**
   * Executes swap on the specified DEX
   */
  async executeSwap(
    dex: DexType,
    tokenIn: string,
    tokenOut: string,
    amountIn: number,
    minAmountOut: number
  ): Promise<SwapResult> {
    logger.info({
      dex,
      tokenIn,
      tokenOut,
      amountIn,
      minAmountOut,
    }, 'Executing swap on selected DEX');

    const router = dex === DexType.RAYDIUM ? this.raydiumRouter : this.meteoraRouter;
    
    try {
      const result = await router.executeSwap(tokenIn, tokenOut, amountIn, minAmountOut);
      return result;
    } catch (error) {
      logger.error({
        error,
        dex,
        tokenIn,
        tokenOut,
        amountIn,
      }, 'Swap execution failed');
      throw error;
    }
  }
}
