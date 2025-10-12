// Service professionnel de tracking des activités utilisateur
import { Pool } from 'pg';

export class ActivityLogger {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Log une action utilisateur avec géolocalisation
   */
  async logActivity({
    userId,
    userEmail,
    actionType,
    actionDescription,
    entityType,
    entityId,
    ipAddress,
    userAgent,
    metadata = {}
  }: {
    userId?: number;
    userEmail?: string;
    actionType: string;
    actionDescription: string;
    entityType?: string;
    entityId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
  }) {
    try {
      // Extraire infos de géolocalisation (à améliorer avec API)
      const geoInfo = await this.getGeoLocation(ipAddress);

      await this.pool.query(
        `INSERT INTO activity_logs 
        (user_id, user_email, action_type, action_description, entity_type, entity_id, 
         ip_address, user_agent, country, city, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          userId || null,
          userEmail,
          actionType,
          actionDescription,
          entityType || null,
          entityId || null,
          ipAddress,
          userAgent,
          geoInfo.country,
          geoInfo.city,
          JSON.stringify(metadata)
        ]
      );
    } catch (error) {
      console.error('Erreur lors du logging:', error);
      // Ne pas faire échouer la requête principale
    }
  }

  /**
   * Log une action de paiement
   */
  async logPayment({
    transactionId,
    orderId,
    userId,
    paymentMethod,
    provider,
    amount,
    currency,
    status,
    ipAddress,
    userAgent,
    metadata = {}
  }: {
    transactionId: string;
    orderId?: string;
    userId?: number;
    paymentMethod: string;
    provider?: string;
    amount: number;
    currency: string;
    status: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
  }) {
    try {
      // Convertir le montant dans toutes les devises
      const amounts = await this.convertCurrency(amount, currency);

      await this.pool.query(
        `INSERT INTO payment_logs 
        (transaction_id, order_id, user_id, payment_method, provider, 
         amount, currency, amount_eur, amount_usd, amount_cdf,
         status, ip_address, user_agent, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          transactionId,
          orderId || null,
          userId || null,
          paymentMethod,
          provider || null,
          amount,
          currency,
          amounts.eur,
          amounts.usd,
          amounts.cdf,
          status,
          ipAddress,
          userAgent,
          JSON.stringify(metadata)
        ]
      );
    } catch (error) {
      console.error('Erreur lors du logging du paiement:', error);
    }
  }

  /**
   * Récupérer les activités d'un utilisateur
   */
  async getUserActivities(userId: number, limit = 50, offset = 0) {
    const result = await this.pool.query(
      `SELECT * FROM activity_logs 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  /**
   * Récupérer toutes les activités (admin)
   */
  async getAllActivities(filters: {
    userId?: number;
    actionType?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  } = {}) {
    const { userId, actionType, dateFrom, dateTo, limit = 100, offset = 0 } = filters;
    
    let query = 'SELECT * FROM activity_logs WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (userId) {
      query += ` AND user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    if (actionType) {
      query += ` AND action_type = $${paramCount}`;
      params.push(actionType);
      paramCount++;
    }

    if (dateFrom) {
      query += ` AND created_at >= $${paramCount}`;
      params.push(dateFrom);
      paramCount++;
    }

    if (dateTo) {
      query += ` AND created_at <= $${paramCount}`;
      params.push(dateTo);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  /**
   * Récupérer les paiements d'un utilisateur
   */
  async getUserPayments(userId: number) {
    const result = await this.pool.query(
      `SELECT * FROM payment_logs 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  /**
   * Statistiques d'activité
   */
  async getActivityStats(userId?: number) {
    const userFilter = userId ? 'WHERE user_id = $1' : '';
    const params = userId ? [userId] : [];

    const result = await this.pool.query(
      `SELECT 
        action_type,
        COUNT(*) as count,
        DATE_TRUNC('day', created_at) as date
       FROM activity_logs
       ${userFilter}
       GROUP BY action_type, DATE_TRUNC('day', created_at)
       ORDER BY date DESC`,
      params
    );
    return result.rows;
  }

  /**
   * Géolocalisation basique (à améliorer avec API externe)
   */
  private async getGeoLocation(ipAddress?: string) {
    // TODO: Intégrer une API de géolocalisation (ipapi.co, ipgeolocation.io, etc.)
    // Pour l'instant, retourner des valeurs par défaut
    return {
      country: 'RDC',
      city: 'Kinshasa'
    };
  }

  /**
   * Convertir un montant dans toutes les devises
   */
  private async convertCurrency(amount: number, fromCurrency: string) {
    try {
      const result = await this.pool.query(
        `SELECT target_currency, rate FROM currency_rates WHERE base_currency = $1`,
        [fromCurrency]
      );

      const amounts: any = {};
      amounts[fromCurrency.toLowerCase()] = amount;

      result.rows.forEach(row => {
        amounts[row.target_currency.toLowerCase()] = amount * parseFloat(row.rate);
      });

      return {
        eur: amounts.eur || amount,
        usd: amounts.usd || amount,
        cdf: amounts.cdf || amount
      };
    } catch (error) {
      console.error('Erreur conversion devise:', error);
      return { eur: amount, usd: amount, cdf: amount };
    }
  }

  /**
   * Créer une notification admin
   */
  async createAdminNotification({
    type,
    title,
    message,
    severity = 'info',
    metadata = {}
  }: {
    type: string;
    title: string;
    message: string;
    severity?: 'info' | 'warning' | 'error' | 'success';
    metadata?: any;
  }) {
    try {
      await this.pool.query(
        `INSERT INTO admin_notifications (type, title, message, severity, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        [type, title, message, severity, JSON.stringify(metadata)]
      );
    } catch (error) {
      console.error('Erreur création notification:', error);
    }
  }
}

// Types d'actions pour constantes
export const ActionTypes = {
  // Authentification
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REGISTER: 'REGISTER',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  
  // Navigation
  VIEW_PRODUCT: 'VIEW_PRODUCT',
  VIEW_CATEGORY: 'VIEW_CATEGORY',
  SEARCH: 'SEARCH',
  
  // Panier
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_CART: 'UPDATE_CART',
  CLEAR_CART: 'CLEAR_CART',
  
  // Wishlist
  ADD_TO_WISHLIST: 'ADD_TO_WISHLIST',
  REMOVE_FROM_WISHLIST: 'REMOVE_FROM_WISHLIST',
  
  // Commandes
  CHECKOUT_START: 'CHECKOUT_START',
  ORDER_PLACED: 'ORDER_PLACED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  
  // Paiements
  PAYMENT_INITIATED: 'PAYMENT_INITIATED',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  
  // Admin
  ADMIN_LOGIN: 'ADMIN_LOGIN',
  PRODUCT_CREATED: 'PRODUCT_CREATED',
  PRODUCT_UPDATED: 'PRODUCT_UPDATED',
  PRODUCT_DELETED: 'PRODUCT_DELETED',
  ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
} as const;
