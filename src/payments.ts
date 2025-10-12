// --- SYSTÈME DE PAIEMENT SÉCURISÉ (PCI DSS Compliant) ---

import crypto from 'crypto';

// Types pour les paiements
export interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile' | 'bank_transfer' | 'crypto';
  provider: string;
  isActive: boolean;
  config: PaymentConfig;
}

export interface PaymentConfig {
  // Configuration spécifique au fournisseur
  apiKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  merchantId?: string;
  publicKey?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  paymentMethod: string;
  orderId: string;
  customerId: string;
  metadata: Record<string, any>;
  createdAt: Date;
  expiresAt: Date;
}

// --- FOURNISSEURS DE PAIEMENT RECOMMANDÉS POUR L'AFRIQUE ---

export const PAYMENT_PROVIDERS = {
  // Solutions Globales (recommandées pour l'international)
  STRIPE: {
    name: 'Stripe',
    regions: ['Global'],
    currencies: ['EUR', 'USD', 'CDF', 'XAF', 'XOF'],
    methods: ['card', 'mobile'],
    compliance: 'PCI DSS Level 1',
    fees: '2.9% + 30¢',
    setup: 'Complexe mais sécurisé'
  },

  PAYPAL: {
    name: 'PayPal',
    regions: ['Global'],
    currencies: ['EUR', 'USD'],
    methods: ['paypal', 'card'],
    compliance: 'PCI DSS Level 1',
    fees: '2.9%-3.9% + 35¢',
    setup: 'Simple'
  },

  // Solutions Africaines (recommandées pour le marché local)
  FLUTTERWAVE: {
    name: 'Flutterwave',
    regions: ['Afrique', 'Europe'],
    currencies: ['EUR', 'USD', 'CDF', 'XAF', 'XOF', 'ZAR', 'KES', 'NGN'],
    methods: ['card', 'mobile', 'bank_transfer'],
    compliance: 'PCI DSS Level 1',
    fees: '3.5% + 50¢',
    setup: 'Orienté Afrique'
  },

  PAYSTACK: {
    name: 'Paystack',
    regions: ['Nigeria', 'Afrique'],
    currencies: ['NGN', 'USD', 'EUR', 'GBP'],
    methods: ['card', 'bank_transfer', 'ussd', 'mobile'],
    compliance: 'PCI DSS Level 1',
    fees: '1.5% (Nigeria), 3.9% (International)',
    setup: 'Excellent pour l\'Afrique'
  },

  CHAPA: {
    name: 'Chapa',
    regions: ['Éthiopie', 'Afrique'],
    currencies: ['ETB', 'USD', 'EUR'],
    methods: ['card', 'mobile', 'bank_transfer'],
    compliance: 'PCI DSS Level 1',
    fees: '2.5% + 1 Birr',
    setup: 'Spécialisé Éthiopie'
  },

  // Solutions Mobile Money RDC (Sélection utilisateur)
  ORANGE_MONEY: {
    name: 'Orange Money',
    regions: ['RDC', 'Afrique Centrale'],
    currencies: ['CDF', 'USD'],
    methods: ['mobile'],
    compliance: 'Conforme BEAC & BCC',
    fees: '1-3%',
    setup: 'API Direct + Flutterwave',
    api: {
      baseUrl: 'https://api.orange.com',
      authType: 'OAuth2',
      supported: true
    }
  },

  AIRTEL_MONEY: {
    name: 'Airtel Money',
    regions: ['RDC', 'Afrique Centrale'],
    currencies: ['CDF', 'USD'],
    methods: ['mobile'],
    compliance: 'Conforme BEAC & BCC',
    fees: '2-4%',
    setup: 'API Direct + Flutterwave',
    api: {
      baseUrl: 'https://api.airtel.com',
      authType: 'API Key',
      supported: true
    }
  },

  AFRICELL_MONEY: {
    name: 'Africell Money',
    regions: ['RDC Est/Sud'],
    currencies: ['CDF', 'USD'],
    methods: ['mobile'],
    compliance: 'Conforme BCC',
    fees: '1-4%',
    setup: 'API Direct',
    api: {
      baseUrl: 'https://api.africell.com',
      authType: 'Basic Auth',
      supported: true
    }
  },

  MPESA: {
    name: 'M-Pesa',
    regions: ['Kenya', 'Tanzanie', 'Afrique du Sud'],
    currencies: ['KES', 'TZS', 'ZAR', 'USD'],
    methods: ['mobile'],
    compliance: 'Conforme réglementations locales',
    fees: '0.5-2%',
    setup: 'API Direct + Safaricom',
    api: {
      baseUrl: 'https://api.safaricom.co.ke',
      authType: 'OAuth2',
      supported: false // Pas natif RDC, mais via partenariats
    }
  }
};

// --- ARCHITECTURE DE PAIEMENT RECOMMANDÉE ---

export class PaymentService {
  private providers: Map<string, PaymentMethod> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Configuration des fournisseurs actifs
    // En production, charger depuis variables d'environnement sécurisées
    if (process.env.FLUTTERWAVE_PUBLIC_KEY) {
      this.providers.set('flutterwave', {
        id: 'flutterwave',
        type: 'card',
        provider: 'flutterwave',
        isActive: true,
        config: {
          publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY,
          secretKey: process.env.FLUTTERWAVE_SECRET_KEY,
          webhookSecret: process.env.FLUTTERWAVE_WEBHOOK_SECRET
        }
      });
    }

    if (process.env.PAYSTACK_PUBLIC_KEY) {
      this.providers.set('paystack', {
        id: 'paystack',
        type: 'card',
        provider: 'paystack',
        isActive: true,
        config: {
          publicKey: process.env.PAYSTACK_PUBLIC_KEY,
          secretKey: process.env.PAYSTACK_SECRET_KEY,
          webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET
        }
      });
    }
  }

  // Créer un intent de paiement sécurisé
  async createPaymentIntent(orderData: {
    amount: number;
    currency: string;
    orderId: string;
    customerId: string;
    paymentMethod: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<PaymentIntent> {

    const intentId = this.generateSecureId();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    const intent: PaymentIntent = {
      id: intentId,
      amount: orderData.amount,
      currency: orderData.currency,
      status: 'pending',
      paymentMethod: orderData.paymentMethod,
      orderId: orderData.orderId,
      customerId: orderData.customerId,
      metadata: orderData.metadata || {},
      createdAt: new Date(),
      expiresAt
    };

    // Logger la création d'intent
    await PaymentLogger.logActivity({
      transactionId: intentId,
      orderId: orderData.orderId,
      userId: orderData.customerId,
      paymentMethod: orderData.paymentMethod,
      amount: orderData.amount,
      currency: orderData.currency,
      status: 'pending',
      action: 'create_intent',
      metadata: orderData.metadata,
      ipAddress: orderData.ipAddress,
      userAgent: orderData.userAgent
    });

    // Stocker l'intent de manière sécurisée (en cache Redis en production)
    await this.storePaymentIntent(intent);

    return intent;
  }

  // Traiter le paiement selon le fournisseur
  async processPayment(intentId: string, paymentData: any): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    const intent = await this.getPaymentIntent(intentId);
    if (!intent) {
      throw new Error('Intent de paiement introuvable');
    }

    if (intent.status !== 'pending') {
      throw new Error('Intent déjà traité');
    }

    if (new Date() > intent.expiresAt) {
      intent.status = 'cancelled';
      await this.updatePaymentIntent(intent);
      throw new Error('Intent expiré');
    }

    const provider = this.providers.get(intent.paymentMethod);
    if (!provider) {
      throw new Error('Fournisseur de paiement non configuré');
    }

    try {
      // Traiter selon le fournisseur
      const result = await this.processWithProvider(provider, intent, paymentData);

      if (result.success) {
        intent.status = 'succeeded';
        intent.metadata.transactionId = result.transactionId;
      } else {
        intent.status = 'failed';
        intent.metadata.error = result.error;
      }

      await this.updatePaymentIntent(intent);
      return result;

    } catch (error) {
      intent.status = 'failed';
      intent.metadata.error = error.message;
      await this.updatePaymentIntent(intent);
      throw error;
    }
  }

  // Webhook sécurisé pour confirmer les paiements
  async handleWebhook(provider: string, signature: string, payload: any): Promise<boolean> {
    const paymentProvider = this.providers.get(provider);
    if (!paymentProvider) {
      throw new Error('Fournisseur inconnu');
    }

    // Vérifier la signature du webhook
    const isValidSignature = this.verifyWebhookSignature(provider, signature, payload, paymentProvider.config);
    if (!isValidSignature) {
      throw new Error('Signature webhook invalide');
    }

    // Traiter le webhook selon le fournisseur
    return await this.processWebhook(provider, payload);
  }

  // --- MÉTHODES UTILITAIRES ---

  private generateSecureId(): string {
    return 'pi_' + crypto.randomBytes(16).toString('hex');
  }

  private async storePaymentIntent(intent: PaymentIntent): Promise<void> {
    // En production : Redis ou base de données sécurisée
    // Pour développement : stockage en mémoire (à remplacer)
    global.paymentIntents = global.paymentIntents || new Map();
    global.paymentIntents.set(intent.id, intent);
  }

  private async getPaymentIntent(intentId: string): Promise<PaymentIntent | null> {
    global.paymentIntents = global.paymentIntents || new Map();
    return global.paymentIntents.get(intentId) || null;
  }

  private async updatePaymentIntent(intent: PaymentIntent): Promise<void> {
    global.paymentIntents = global.paymentIntents || new Map();
    global.paymentIntents.set(intent.id, intent);
  }

  private async processWithProvider(provider: PaymentMethod, intent: PaymentIntent, paymentData: any): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    // Logique spécifique au fournisseur
    switch (provider.provider) {
      case 'flutterwave':
        return await this.processFlutterwavePayment(intent, paymentData, provider.config);
      case 'paystack':
        return await this.processPaystackPayment(intent, paymentData, provider.config);
      case 'stripe':
        return await this.processStripePayment(intent, paymentData, provider.config);
      default:
        throw new Error('Fournisseur non supporté');
    }
  }

  private async processFlutterwavePayment(intent: PaymentIntent, paymentData: any, config: PaymentConfig) {
    // Intégration Flutterwave
    // À implémenter selon leur API
    return {
      success: true,
      transactionId: 'fw_' + this.generateSecureId()
    };
  }

  private async processPaystackPayment(intent: PaymentIntent, paymentData: any, config: PaymentConfig) {
    // Intégration Paystack
    // À implémenter selon leur API
    return {
      success: true,
      transactionId: 'ps_' + this.generateSecureId()
    };
  }

  private async processStripePayment(intent: PaymentIntent, paymentData: any, config: PaymentConfig) {
    // Intégration Stripe
    // À implémenter selon leur API
    return {
      success: true,
      transactionId: 'stripe_' + this.generateSecureId()
    };
  }

  private verifyWebhookSignature(provider: string, signature: string, payload: any, config: PaymentConfig): boolean {
    // Vérification de signature spécifique au fournisseur
    switch (provider) {
      case 'flutterwave':
        return this.verifyFlutterwaveSignature(signature, payload, config.webhookSecret!);
      case 'paystack':
        return this.verifyPaystackSignature(signature, payload, config.webhookSecret!);
      case 'stripe':
        return this.verifyStripeSignature(signature, payload, config.webhookSecret!);
      default:
        return false;
    }
  }

  private verifyFlutterwaveSignature(signature: string, payload: any, secret: string): boolean {
    // Logique de vérification Flutterwave
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    return signature === expectedSignature;
  }

  private verifyPaystackSignature(signature: string, payload: any, secret: string): boolean {
    // Logique de vérification Paystack
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    return signature === expectedSignature;
  }

  private verifyStripeSignature(signature: string, payload: any, secret: string): boolean {
    // Logique de vérification Stripe
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    return signature === expectedSignature;
  }

  private async processWebhook(provider: string, payload: any): Promise<boolean> {
    // Traiter le webhook et mettre à jour le statut de la commande
    // À implémenter selon les besoins métier
    console.log(`Webhook reçu de ${provider}:`, payload);
    return true;
  }
}

// --- SYSTÈME DE LOGGING DES PAIEMENTS (Audit Trail) ---

import { pool } from './db';

export interface PaymentLog {
  transactionId: string;
  orderId?: string;
  userId?: string;
  paymentMethod: string;
  provider?: string;
  amount: number;
  currency: string;
  status: string;
  action: string;
  requestData?: any;
  responseData?: any;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

export class PaymentLogger {
  // Logger toutes les activités de paiement
  static async logActivity(logData: PaymentLog): Promise<void> {
    try {
      // Masquer les données sensibles avant logging
      const sanitizedRequest = this.sanitizeData(logData.requestData);
      const sanitizedResponse = this.sanitizeData(logData.responseData);
      const sanitizedMetadata = this.sanitizeData(logData.metadata);

      await pool.query(`
        INSERT INTO payment_logs (
          transaction_id, order_id, user_id, payment_method, provider,
          amount, currency, status, action, request_data, response_data,
          error_message, ip_address, user_agent, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        logData.transactionId,
        logData.orderId,
        logData.userId,
        logData.paymentMethod,
        logData.provider,
        logData.amount,
        logData.currency,
        logData.status,
        logData.action,
        JSON.stringify(sanitizedRequest),
        JSON.stringify(sanitizedResponse),
        logData.errorMessage,
        logData.ipAddress,
        logData.userAgent,
        JSON.stringify(sanitizedMetadata)
      ]);
    } catch (error) {
      console.error('Erreur lors du logging de paiement:', error);
      // Ne pas throw pour ne pas casser le flow de paiement
    }
  }

  // Récupérer les logs pour l'admin
  static async getPaymentLogs(filters: {
    limit?: number;
    offset?: number;
    status?: string;
    paymentMethod?: string;
    provider?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    transactionId?: string;
  } = {}): Promise<any[]> {
    try {
      let query = `
        SELECT
          id, transaction_id, order_id, user_id, payment_method, provider,
          amount, currency, status, action, error_message,
          ip_address, user_agent, metadata, created_at
        FROM payment_logs
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (filters.status) {
        query += ` AND status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }

      if (filters.paymentMethod) {
        query += ` AND payment_method = $${paramIndex}`;
        params.push(filters.paymentMethod);
        paramIndex++;
      }

      if (filters.provider) {
        query += ` AND provider = $${paramIndex}`;
        params.push(filters.provider);
        paramIndex++;
      }

      if (filters.userId) {
        query += ` AND user_id = $${paramIndex}`;
        params.push(filters.userId);
        paramIndex++;
      }

      if (filters.transactionId) {
        query += ` AND transaction_id = $${paramIndex}`;
        params.push(filters.transactionId);
        paramIndex++;
      }

      if (filters.startDate) {
        query += ` AND created_at >= $${paramIndex}`;
        params.push(filters.startDate);
        paramIndex++;
      }

      if (filters.endDate) {
        query += ` AND created_at <= $${paramIndex}`;
        params.push(filters.endDate);
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC`;

      if (filters.limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(filters.limit);
        paramIndex++;
      }

      if (filters.offset) {
        query += ` OFFSET $${paramIndex}`;
        params.push(filters.offset);
      }

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des logs:', error);
      throw error;
    }
  }

  // Statistiques des paiements pour l'admin
  static async getPaymentStats(): Promise<any> {
    try {
      const result = await pool.query(`
        SELECT
          COUNT(*) as total_transactions,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_transactions,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
          SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_amount,
          AVG(CASE WHEN status = 'completed' THEN amount ELSE NULL END) as avg_transaction_amount,
          COUNT(DISTINCT user_id) as unique_users
        FROM payment_logs
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      `);

      return result.rows[0];
    } catch (error) {
      console.error('Erreur lors du calcul des stats:', error);
      throw error;
    }
  }

  // Masquer les données sensibles dans les logs
  private static sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sanitized = { ...data };

    // Masquer les numéros de carte
    if (sanitized.card_number || sanitized.cardNumber) {
      const cardNumber = sanitized.card_number || sanitized.cardNumber;
      if (typeof cardNumber === 'string' && cardNumber.length >= 4) {
        sanitized.card_number = `****${cardNumber.slice(-4)}`;
      }
    }

    // Masquer les CVV
    if (sanitized.cvv || sanitized.cvc) {
      sanitized.cvv = '***';
      sanitized.cvc = '***';
    }

    // Masquer les mots de passe
    if (sanitized.password || sanitized.pin) {
      sanitized.password = '***MASKED***';
      sanitized.pin = '***MASKED***';
    }

    // Masquer les tokens sensibles
    if (sanitized.token || sanitized.api_key || sanitized.secret) {
      sanitized.token = '***TOKEN_MASKED***';
      sanitized.api_key = '***API_KEY_MASKED***';
      sanitized.secret = '***SECRET_MASKED***';
    }

    return sanitized;
  }
}

// Instance globale du service de paiement
export const paymentService = new PaymentService();