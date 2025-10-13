import React, { createContext, useContext, useEffect, useState } from 'react';
import { formatCurrency, getSupportedCurrencies } from '@/lib/currencyClient';

type CurrencyState = {
  currency: string;
  setCurrency: (c: string) => void;
  format: (amount: number) => string;
  supported: { code: string; name: string; symbol: string }[];
};

const CurrencyContext = createContext<CurrencyState | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('tb_currency');
      return saved || 'EUR';
    } catch (e) {
      return 'EUR';
    }
  });

  // utiliser un helper léger côté client pour formatter

  useEffect(() => {
    try {
      localStorage.setItem('tb_currency', currency);
    } catch (e) {
      // ignore
    }
  }, [currency]);

  const setCurrency = (c: string) => {
    setCurrencyState(c.toUpperCase());
    // Persist côté serveur si l'utilisateur est connecté -- géré ailleurs
  };

  const format = (amount: number) => {
    return formatCurrency(amount, currency, 'fr-FR');
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format, supported: getSupportedCurrencies() }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};

export default CurrencyContext;
