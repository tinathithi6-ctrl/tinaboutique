import { describe, it, expect } from 'vitest';
import { formatCurrency, getSupportedCurrencies } from '../currencyClient';

describe('currencyClient', () => {
  it('formats EUR correctly', () => {
    const s = formatCurrency(12.5, 'EUR', 'fr-FR');
    expect(s).toContain('€');
  });

  it('returns supported currencies', () => {
    const list = getSupportedCurrencies();
    expect(list.find(c => c.code === 'CDF')).toBeTruthy();
  });
});
