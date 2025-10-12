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
      // TODO: Implémenter l'appel à une API de taux de change
      // Exemple avec exchangerate-api.com (gratuit)
      /*
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
      const data = await response.json();
      
      const rates = [
        { from: 'EUR', to: 'USD', rate: data.rates.USD },
        { from: 'EUR', to: 'CDF', rate: data.rates.CDF || 3000 },
        // ... autres conversions
      ];
      
      return await this.updateRates(rates);
      */
      
      console.log('Mise à jour des taux depuis API externe non implémentée');
      return false;
    } catch (error) {
      console.error('Erreur récupération taux live:', error);
      return false;
    }
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
