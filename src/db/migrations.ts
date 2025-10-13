// Système de migrations pour créer les tables nécessaires
import { Pool } from 'pg';

export const createActivityLogsTable = `
-- Table des logs d'activité pour traçabilité complète
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  action_type VARCHAR(100) NOT NULL,
  action_description TEXT NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour recherche rapide
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_activity_user_id') THEN
    BEGIN
      EXECUTE $idx$CREATE INDEX idx_activity_user_id ON activity_logs(user_id)$idx$;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping CREATE INDEX idx_activity_user_id due to permissions: %', SQLERRM;
    END;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_activity_action_type') THEN
    BEGIN
      EXECUTE $idx$CREATE INDEX idx_activity_action_type ON activity_logs(action_type)$idx$;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping CREATE INDEX idx_activity_action_type due to permissions: %', SQLERRM;
    END;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_activity_created_at') THEN
    BEGIN
      EXECUTE $idx$CREATE INDEX idx_activity_created_at ON activity_logs(created_at DESC)$idx$;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping CREATE INDEX idx_activity_created_at due to permissions: %', SQLERRM;
    END;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_activity_entity') THEN
    BEGIN
      EXECUTE $idx$CREATE INDEX idx_activity_entity ON activity_logs(entity_type, entity_id)$idx$;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping CREATE INDEX idx_activity_entity due to permissions: %', SQLERRM;
    END;
  END IF;
END $$;

-- Commentaires pour documentation (tolérant aux permissions)
DO $$
BEGIN
  BEGIN
  EXECUTE $comment$COMMENT ON TABLE activity_logs IS 'Historique complet de toutes les actions des utilisateurs'$comment$;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping COMMENT ON TABLE activity_logs due to permissions: %', SQLERRM;
  END;

  BEGIN
  EXECUTE $comment$COMMENT ON COLUMN activity_logs.action_type IS 'Type: LOGIN, LOGOUT, VIEW_PRODUCT, ADD_TO_CART, REMOVE_FROM_CART, CHECKOUT, PAYMENT, ORDER_PLACED, etc.'$comment$;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping COMMENT ON COLUMN activity_logs.action_type due to permissions: %', SQLERRM;
  END;

  BEGIN
  EXECUTE $comment$COMMENT ON COLUMN activity_logs.metadata IS 'Données additionnelles en JSON (prix, quantité, produit, etc.)'$comment$;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping COMMENT ON COLUMN activity_logs.metadata due to permissions: %', SQLERRM;
  END;
END $$;
`;

export const createPaymentLogsTable = `
-- Table des logs de paiement (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS payment_logs (
  id SERIAL PRIMARY KEY,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  payment_method VARCHAR(50) NOT NULL,
  provider VARCHAR(50),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  amount_eur DECIMAL(10, 2),
  amount_usd DECIMAL(10, 2),
  amount_cdf DECIMAL(12, 2),
  status VARCHAR(50) DEFAULT 'pending',
  action VARCHAR(50),
  error_message TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour recherche rapide
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_payment_order_id') THEN
    BEGIN
      EXECUTE $idx$CREATE INDEX idx_payment_order_id ON payment_logs(order_id)$idx$;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping CREATE INDEX idx_payment_order_id due to permissions: %', SQLERRM;
    END;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_payment_user_id') THEN
    BEGIN
      EXECUTE $idx$CREATE INDEX idx_payment_user_id ON payment_logs(user_id)$idx$;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping CREATE INDEX idx_payment_user_id due to permissions: %', SQLERRM;
    END;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_payment_status') THEN
    BEGIN
      EXECUTE $idx$CREATE INDEX idx_payment_status ON payment_logs(status)$idx$;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping CREATE INDEX idx_payment_status due to permissions: %', SQLERRM;
    END;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_payment_created_at') THEN
    BEGIN
      EXECUTE $idx$CREATE INDEX idx_payment_created_at ON payment_logs(created_at DESC)$idx$;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping CREATE INDEX idx_payment_created_at due to permissions: %', SQLERRM;
    END;
  END IF;
END $$;

DO $$
BEGIN
  BEGIN
  EXECUTE $comment$COMMENT ON TABLE payment_logs IS 'Historique complet de tous les paiements avec traçabilité'$comment$;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping COMMENT ON TABLE payment_logs due to permissions: %', SQLERRM;
  END;
END $$;
`;

export const createCurrencyTable = `
-- Table des taux de change pour multi-devises
CREATE TABLE IF NOT EXISTS currency_rates (
  id SERIAL PRIMARY KEY,
  base_currency VARCHAR(3) DEFAULT 'EUR',
  target_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(12, 6) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(base_currency, target_currency)
);

-- Insérer les taux par défaut (à mettre à jour régulièrement)
-- Insérer les taux par défaut (à mettre à jour régulièrement)
DO $$
BEGIN
  BEGIN
    EXECUTE $ins$INSERT INTO currency_rates (base_currency, target_currency, rate) 
    VALUES 
      ('EUR', 'USD', 1.08),
      ('EUR', 'CDF', 3000.00),
      ('USD', 'EUR', 0.93),
      ('USD', 'CDF', 2780.00),
      ('CDF', 'EUR', 0.00033),
      ('CDF', 'USD', 0.00036)
    ON CONFLICT (base_currency, target_currency) DO NOTHING$ins$;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping default currency_rates INSERT due to permissions: %', SQLERRM;
  END;
END $$;

DO $$
BEGIN
  BEGIN
  EXECUTE $comment$COMMENT ON TABLE currency_rates IS 'Taux de change pour EUR, USD, CDF'$comment$;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping COMMENT ON TABLE currency_rates due to permissions: %', SQLERRM;
  END;
END $$;
`;

export const createUserSessionsTable = `
-- Table des sessions utilisateur pour tracking détaillé
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(50),
  browser VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_sessions_user_id') THEN
    BEGIN
      EXECUTE $idx$CREATE INDEX idx_sessions_user_id ON user_sessions(user_id)$idx$;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping CREATE INDEX idx_sessions_user_id due to permissions: %', SQLERRM;
    END;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_sessions_token') THEN
    BEGIN
      EXECUTE $idx$CREATE INDEX idx_sessions_token ON user_sessions(session_token)$idx$;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping CREATE INDEX idx_sessions_token due to permissions: %', SQLERRM;
    END;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_sessions_active') THEN
    BEGIN
      EXECUTE $idx$CREATE INDEX idx_sessions_active ON user_sessions(is_active)$idx$;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping CREATE INDEX idx_sessions_active due to permissions: %', SQLERRM;
    END;
  END IF;
END $$;

DO $$
BEGIN
  BEGIN
  EXECUTE $comment$COMMENT ON TABLE user_sessions IS 'Sessions utilisateur actives avec géolocalisation'$comment$;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping COMMENT ON TABLE user_sessions due to permissions: %', SQLERRM;
  END;
END $$;
`;

export const addCurrencyColumnsToOrders = `
-- Ajouter colonnes multi-devises à la table orders si elles n'existent pas
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='currency') THEN
    ALTER TABLE orders ADD COLUMN currency VARCHAR(3) DEFAULT 'EUR';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='amount_eur') THEN
    ALTER TABLE orders ADD COLUMN amount_eur DECIMAL(10, 2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='amount_usd') THEN
    ALTER TABLE orders ADD COLUMN amount_usd DECIMAL(10, 2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='amount_cdf') THEN
    ALTER TABLE orders ADD COLUMN amount_cdf DECIMAL(12, 2);
  END IF;
END $$;

DO $$
BEGIN
  BEGIN
  EXECUTE $comment$COMMENT ON COLUMN orders.currency IS 'Devise choisie par le client: EUR, USD, CDF'$comment$;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping COMMENT ON COLUMN orders.currency due to permissions: %', SQLERRM;
  END;
END $$;
`;

export const createAdminNotificationsTable = `
-- Table des notifications admin pour alertes
CREATE TABLE IF NOT EXISTS admin_notifications (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_admin_notif_read') THEN
    BEGIN
      EXECUTE $idx$CREATE INDEX idx_admin_notif_read ON admin_notifications(is_read)$idx$;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping CREATE INDEX idx_admin_notif_read due to permissions: %', SQLERRM;
    END;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_admin_notif_created') THEN
    BEGIN
      EXECUTE $idx$CREATE INDEX idx_admin_notif_created ON admin_notifications(created_at DESC)$idx$;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping CREATE INDEX idx_admin_notif_created due to permissions: %', SQLERRM;
    END;
  END IF;
END $$;

DO $$
BEGIN
  BEGIN
  EXECUTE $comment$COMMENT ON TABLE admin_notifications IS 'Notifications pour administrateurs (fraudes, stocks, etc.)'$comment$;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping COMMENT ON TABLE admin_notifications due to permissions: %', SQLERRM;
  END;
END $$;
`;

export const createCurrencyRateHistoryTable = `
-- Historique des modifications des taux de change
CREATE TABLE IF NOT EXISTS currency_rate_history (
  id SERIAL PRIMARY KEY,
  admin_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  admin_email VARCHAR(255),
  base_currency VARCHAR(3) NOT NULL,
  target_currency VARCHAR(3) NOT NULL,
  old_rate DECIMAL(12,6),
  new_rate DECIMAL(12,6) NOT NULL,
  change_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_currency_rate_history_base_target') THEN
    BEGIN
      EXECUTE $idx$CREATE INDEX idx_currency_rate_history_base_target ON currency_rate_history(base_currency, target_currency)$idx$;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping CREATE INDEX idx_currency_rate_history_base_target due to permissions: %', SQLERRM;
    END;
  END IF;
END $$;
DO $$
BEGIN
  BEGIN
  EXECUTE $comment$COMMENT ON TABLE currency_rate_history IS 'Historique des modifications manuelles des taux de change par les admins'$comment$;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping COMMENT ON TABLE currency_rate_history due to permissions: %', SQLERRM;
  END;
END $$;
`;

// Fonction pour exécuter toutes les migrations
export async function runMigrations(pool: Pool) {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Démarrage des migrations...');
    
    // Exécuter chaque migration
    await client.query(createActivityLogsTable);
    console.log('✅ Table activity_logs créée');
    
    await client.query(createPaymentLogsTable);
    console.log('✅ Table payment_logs créée');
    
    await client.query(createCurrencyTable);
    console.log('✅ Table currency_rates créée');
    
    await client.query(createUserSessionsTable);
    console.log('✅ Table user_sessions créée');
    
    await client.query(addCurrencyColumnsToOrders);
    console.log('✅ Colonnes multi-devises ajoutées à orders');
    
    await client.query(createAdminNotificationsTable);
    console.log('✅ Table admin_notifications créée');
    
  await client.query(createCurrencyRateHistoryTable);
  console.log('✅ Table currency_rate_history créée');
    
    console.log('✅ Toutes les migrations terminées avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors des migrations:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Types pour TypeScript
export interface ActivityLog {
  id: number;
  user_id: string | null;
  user_email: string;
  action_type: string;
  action_description: string;
  entity_type?: string;
  entity_id?: string;
  ip_address?: string;
  user_agent?: string;
  country?: string;
  city?: string;
  metadata?: any;
  created_at: Date;
}

export interface PaymentLog {
  id: number;
  transaction_id: string;
  order_id?: string;
  user_id?: string;
  payment_method: string;
  provider?: string;
  amount: number;
  currency: string;
  amount_eur?: number;
  amount_usd?: number;
  amount_cdf?: number;
  status: string;
  action?: string;
  error_message?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}
