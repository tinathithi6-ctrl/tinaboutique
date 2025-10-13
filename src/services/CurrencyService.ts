// Service professionnel de gestion multi-devises pour RDC
import { Pool } from 'pg';

export class CurrencyService {
  private pool: Pool;
  private cacheRates: Map<string, { rate: number, timestamp: number }> = new Map();
  private cacheDuration = 3600000; // 1 heure

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Convertir un montant d'une devise à une autre
   */
  async convert(amount: number, from: string, to: string): Promise<number> {
    if (from === to) return amount;

    const rate = await this.getRate(from, to);
    return amount * rate;
  }

  /**
   * Obtenir le taux de change entre deux devises
   */
  async getRate(from: string, to: string): Promise<number> {
    const cacheKey = `${from}_${to}`;
    const cached = this.cacheRates.get(cacheKey);

    // Vérifier le cache
    if (cached && (Date.now() - cached.timestamp) < this.cacheDuration) {
      return cached.rate;
    }

    // Récupérer de la base de données
    try {
      const result = await this.pool.query(
        `SELECT rate FROM currency_rates 
         WHERE base_currency = $1 AND target_currency = $2`,
        [from.toUpperCase(), to.toUpperCase()]
      );

      if (result.rows.length > 0) {
        const rate = parseFloat(result.rows[0].rate);
        this.cacheRates.set(cacheKey, { rate, timestamp: Date.now() });
        return rate;
      }
    } catch (error) {
      console.error('Erreur récupération taux:', error);
    }

    // Taux par défaut si non trouvé
    return this.getDefaultRate(from, to);
  }

  /**
   * Convertir un montant dans toutes les devises
   */
  async convertToAll(amount: number, fromCurrency: string): Promise<{
    eur: number;
    usd: number;
    cdf: number;
  }> {
    const [eur, usd, cdf] = await Promise.all([
      this.convert(amount, fromCurrency, 'EUR'),
      this.convert(amount, fromCurrency, 'USD'),
      this.convert(amount, fromCurrency, 'CDF'),
    ]);

    return { eur, usd, cdf };
  }

  /**
   * Formater un montant avec la devise
   */
  format(amount: number, currency: string, locale = 'fr-FR'): string {
    const currencies: Record<string, string> = {
      'EUR': 'EUR',
      'USD': 'USD',
      'CDF': 'CDF'
    };

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencies[currency.toUpperCase()] || 'EUR'
    }).format(amount);
  }

  /**
   * Mettre à jour les taux de change
   */
  async updateRates(rates: Array<{ from: string, to: string, rate: number }>) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      for (const { from, to, rate } of rates) {
        await client.query(
          `INSERT INTO currency_rates (base_currency, target_currency, rate, updated_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (base_currency, target_currency)
           DO UPDATE SET rate = $3, updated_at = NOW()`,
          [from.toUpperCase(), to.toUpperCase(), rate]
        );
      }

      await client.query('COMMIT');
      
      // Vider le cache
      this.cacheRates.clear();
      
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erreur mise à jour taux:', error);
      return false;
    } finally {
      client.release();
    }
  }

  /**
   * Récupérer tous les taux actuels
   */
  async getAllRates() {
    const result = await this.pool.query(
      `SELECT base_currency, target_currency, rate, updated_at 
       FROM currency_rates 
       ORDER BY base_currency, target_currency`
    );
    return result.rows;
  }

  /**
   * Taux par défaut (fallback)
   */
  private getDefaultRate(from: string, to: string): number {
    const rates: Record<string, Record<string, number>> = {
      'EUR': { 'USD': 1.08, 'CDF': 3000.00, 'EUR': 1 },
      'USD': { 'EUR': 0.93, 'CDF': 2780.00, 'USD': 1 },
      'CDF': { 'EUR': 0.00033, 'USD': 0.00036, 'CDF': 1 }
    };

    return rates[from.toUpperCase()]?.[to.toUpperCase()] || 1;
  }

  /**
   * Obtenir la devise préférée de l'utilisateur
   */
  async getUserPreferredCurrency(userId: number): Promise<string> {
    try {
      const result = await this.pool.query(
        `SELECT preferred_currency FROM users WHERE id = $1`,
        [userId]
      );

      return result.rows[0]?.preferred_currency || 'EUR';
    } catch (error) {
      return 'EUR';
    }
  }

  /**
   * Définir la devise préférée de l'utilisateur
   */
  async setUserPreferredCurrency(userId: number, currency: string) {
    try {
      await this.pool.query(
        `UPDATE users SET preferred_currency = $1 WHERE id = $2`,
        [currency.toUpperCase(), userId]
      );
      return true;
    } catch (error) {
      console.error('Erreur définition devise:', error);
      return false;
    }
  }

  /**
   * Récupérer les taux depuis une API externe (optionnel)
   * Recommandé: exchangerate-api.com, fixer.io, ou currencylayer.com
   */
  async fetchLiveRates(): Promise<boolean> {
    try {
      // Exemple: utiliser exchangerate.host (gratuit, pas d'API key)
      const resp = await fetch('https://api.exchangerate.host/latest?base=EUR');
      if (!resp.ok) {
        console.warn('fetchLiveRates: API responded with', resp.status);
        return false;
      }
      const data = await resp.json();
      const rates: Array<{ from: string, to: string, rate: number }> = [];
      // On propose EUR->USD et EUR->CDF si présents
      if (data && data.rates) {
        if (data.rates.USD) rates.push({ from: 'EUR', to: 'USD', rate: Number(data.rates.USD) });
        if (data.rates.CDF) rates.push({ from: 'EUR', to: 'CDF', rate: Number(data.rates.CDF) });
        // Ajouter conversions inverses approximatives
        for (const r of [...rates]) {
          if (r.rate && r.rate > 0) {
            const inv = 1 / r.rate;
            rates.push({ from: r.to, to: r.from, rate: Number(inv) });
          }
        }
      }

      // Ne pas appliquer automatiquement — retourner la proposition
      // L'appelant peut décider d'appliquer via updateRates
      // Stocker temporairement dans le cache pour consultation
      for (const r of rates) {
        const key = `${r.from.toUpperCase()}_${r.to.toUpperCase()}`;
        this.cacheRates.set(key, { rate: r.rate, timestamp: Date.now() });
      }

      return true;
    } catch (error) {
      console.error('Erreur récupération taux live:', error);
      return false;
    }
  }

  /**
   * Recharger le cache interne (clear + préfetch optionnel)
   */
  async reloadCache() {
    this.cacheRates.clear();
    // Précharger paires communes
    const pairs = [ ['EUR','USD'], ['EUR','CDF'], ['USD','EUR'], ['USD','CDF'], ['CDF','EUR'], ['CDF','USD'] ];
    for (const [from,to] of pairs) {
      try {
        const r = await this.getRate(from, to);
        // getRate remplira le cache
      } catch (err) {
        // ignore
      }
    }
  }

  /**
   * Retourne les propositions actuellement en cache (générées par fetchLiveRates)
   */
  getCachedProposals() {
    const out: Array<{ from: string; to: string; rate: number; timestamp: number }> = [];
    for (const [k, v] of this.cacheRates.entries()) {
      const [from, to] = k.split('_');
      out.push({ from, to, rate: v.rate, timestamp: v.timestamp });
    }
    return out;
  }

  /**
   * Appliquer une liste de propositions (utilisé par admin)
   */
  async applyProposals(proposals: Array<{ from: string; to: string; rate: number }>) {
    return await this.updateRates(proposals.map(p => ({ from: p.from, to: p.to, rate: p.rate })));
  }

  /**
   * Obtenir le symbole de la devise
   */
  getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      'EUR': '€',
      'USD': '$',
      'CDF': 'FC'
    };
    return symbols[currency.toUpperCase()] || currency;
  }

  /**
   * Obtenir les devises supportées
   */
  getSupportedCurrencies() {
    return [
      { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
      { code: 'USD', name: 'Dollar Américain', symbol: '$', flag: '🇺🇸' },
      { code: 'CDF', name: 'Franc Congolais', symbol: 'FC', flag: '🇨🇩' }
    ];
  }
}

// Helper pour ajouter la colonne preferred_currency si elle n'existe pas
export const addPreferredCurrencyColumn = `
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='preferred_currency') THEN
    ALTER TABLE users ADD COLUMN preferred_currency VARCHAR(3) DEFAULT 'EUR';
  END IF;
END $$;
`;
