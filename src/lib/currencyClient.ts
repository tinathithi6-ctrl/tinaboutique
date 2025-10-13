export const supportedCurrencies = [
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'Dollar américain', symbol: '$' },
  { code: 'CDF', name: 'Franc congolais', symbol: 'FC' }
];

export function formatCurrency(amount: number, currency: string, locale = 'fr-FR') {
  const currencies: Record<string, string> = { 'EUR': 'EUR', 'USD': 'USD', 'CDF': 'CDF' };
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currencies[currency.toUpperCase()] || 'EUR' }).format(amount);
}

export function getSupportedCurrencies() {
  return supportedCurrencies;
}
