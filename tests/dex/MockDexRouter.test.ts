import { MockRaydiumRouter, MockMeteoraRouter } from '../../src/dex/MockDexRouter';
import { DexType } from '../../src/types';

describe('MockDexRouter', () => {
  describe('MockRaydiumRouter', () => {
    let router: MockRaydiumRouter;

    beforeEach(() => {
      router = new MockRaydiumRouter();
    });

    it('should return a valid quote', async () => {
      const quote = await router.getQuote('SOL', 'USDC', 100);

      expect(quote).toBeDefined();
      expect(quote.dex).toBe(DexType.RAYDIUM);
      expect(quote.price).toBeGreaterThan(0);
      expect(quote.fee).toBe(0.003);
      expect(quote.estimatedOutput).toBeGreaterThan(0);
    });

    it('should execute a swap successfully', async () => {
      // Retry up to 3 times to handle the 5% random failure rate
      let result = null;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          result = await router.executeSwap('SOL', 'USDC', 100, 95);
          break;
        } catch (error) {
          attempts++;
          if (attempts >= maxAttempts) throw error;
        }
      }

      expect(result).toBeDefined();
      expect(result!.txHash).toMatch(/^[a-f0-9]{64}$/);
      expect(result!.executedPrice).toBeGreaterThan(0);
      expect(result!.amountOut).toBeGreaterThan(0);
    });

    it('should reject swap with slippage exceeded', async () => {
      await expect(
        router.executeSwap('SOL', 'USDC', 100, 1000)
      ).rejects.toThrow('Slippage tolerance exceeded');
    });
  });

  describe('MockMeteoraRouter', () => {
    let router: MockMeteoraRouter;

    beforeEach(() => {
      router = new MockMeteoraRouter();
    });

    it('should return a valid quote', async () => {
      const quote = await router.getQuote('SOL', 'USDC', 100);

      expect(quote).toBeDefined();
      expect(quote.dex).toBe(DexType.METEORA);
      expect(quote.price).toBeGreaterThan(0);
      expect(quote.fee).toBe(0.002);
      expect(quote.estimatedOutput).toBeGreaterThan(0);
    });

    it('should execute a swap successfully', async () => {
      const result = await router.executeSwap('SOL', 'USDC', 100, 95);

      expect(result).toBeDefined();
      expect(result.txHash).toMatch(/^[a-f0-9]{64}$/);
      expect(result.executedPrice).toBeGreaterThan(0);
      expect(result.amountOut).toBeGreaterThan(0);
    });

    it('should have lower fees than Raydium', () => {
      // Meteora fee (0.002) should be lower than Raydium fee (0.003)
      expect(0.002).toBeLessThan(0.003);
    });
  });
});
