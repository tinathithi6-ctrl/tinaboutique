import React from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';

const CurrencySelector: React.FC = () => {
  const { currency, setCurrency, supported } = useCurrency();

  return (
    <div className="currency-selector inline-flex items-center">
      <label className="mr-2 text-sm text-gray-600">Devise</label>
      <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="border rounded px-2 py-1 text-sm">
        {supported.map(s => (
          <option key={s.code} value={s.code}>{s.symbol ? `${s.symbol} ` : ''}{s.code} - {s.name}</option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelector;
