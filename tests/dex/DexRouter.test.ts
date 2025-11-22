import { DexRouter } from '../../src/dex/DexRouter';
import { DexType } from '../../src/types';

describe('DexRouter', () => {
  let router: DexRouter;

  beforeEach(() => {
    router = new DexRouter();
  });

  it('should fetch quotes from both DEXs and select the best one', async () => {
    const bestQuote = await router.getBestQuote('SOL', 'USDC', 100);

    expect(bestQuote).toBeDefined();
    expect([DexType.RAYDIUM, DexType.METEORA]).toContain(bestQuote.dex);
    expect(bestQuote.estimatedOutput).toBeGreaterThan(0);
    expect(bestQuote.price).toBeGreaterThan(0);
  });

  it('should execute swap on the specified DEX', async () => {
    const result = await router.executeSwap(DexType.RAYDIUM, 'SOL', 'USDC', 100, 95);

    expect(result).toBeDefined();
    expect(result.txHash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.executedPrice).toBeGreaterThan(0);
    expect(result.amountOut).toBeGreaterThan(95);
  });

  it('should handle swap execution failures', async () => {
    // Test multiple attempts to trigger the 5% failure rate
    const attempts = 100;
    let failures = 0;

    for (let i = 0; i < attempts; i++) {
      try {
        await router.executeSwap(DexType.RAYDIUM, 'SOL', 'USDC', 10, 9);
      } catch (error) {
        failures++;
      }
    }

    // Should have some failures (around 5%)
    expect(failures).toBeGreaterThan(0);
    expect(failures).toBeLessThan(15); // Should be less than 15% for 100 attempts
  });

  it('should provide different quotes for different token pairs', async () => {
    const quote1 = await router.getBestQuote('SOL', 'USDC', 100);
    const quote2 = await router.getBestQuote('ETH', 'USDC', 100);

    // Quotes should differ based on token pair
    expect(quote1.estimatedOutput).not.toBe(quote2.estimatedOutput);
  });
});
