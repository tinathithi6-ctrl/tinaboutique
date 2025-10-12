@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   🚀 INITIALISATION SYSTÈME TRAÇABILITÉ - TINA BOUTIQUE ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo 📋 Ce script va créer toutes les tables nécessaires pour:
echo    - Traçabilité complète (activity_logs)
echo    - Historique paiements (payment_logs)
echo    - Multi-devises (currency_rates)
echo    - Sessions utilisateur (user_sessions)
echo.
echo ⚠️  IMPORTANT: Assurez-vous que PostgreSQL est démarré !
echo.
pause

echo.
echo 🔄 Connexion à la base de données...
echo.

REM Définir les variables de connexion
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=tinaboutique
set PGUSER=postgres

echo 📝 Veuillez entrer le mot de passe PostgreSQL:
psql -U postgres -d tinaboutique -c "\dt" >nul 2>&1

if errorlevel 1 (
    echo.
    echo ❌ Erreur de connexion à PostgreSQL !
    echo    Vérifiez que:
    echo    1. PostgreSQL est démarré
    echo    2. La base 'tinaboutique' existe
    echo    3. Le mot de passe est correct
    echo.
    pause
    exit /b 1
)

echo ✅ Connexion réussie !
echo.
echo 🏗️  Création des tables...
echo.

REM Créer le fichier SQL temporaire
(
echo -- Table activity_logs
echo CREATE TABLE IF NOT EXISTS activity_logs (
echo   id SERIAL PRIMARY KEY,
echo   user_id INTEGER REFERENCES users(id^) ON DELETE SET NULL,
echo   user_email VARCHAR(255^),
echo   action_type VARCHAR(100^) NOT NULL,
echo   action_description TEXT NOT NULL,
echo   entity_type VARCHAR(100^),
echo   entity_id VARCHAR(255^),
echo   ip_address VARCHAR(45^),
echo   user_agent TEXT,
echo   country VARCHAR(100^),
echo   city VARCHAR(100^),
echo   metadata JSONB,
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^);
echo.
echo CREATE INDEX IF NOT EXISTS idx_activity_user_id ON activity_logs(user_id^);
echo CREATE INDEX IF NOT EXISTS idx_activity_action_type ON activity_logs(action_type^);
echo CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_logs(created_at DESC^);
echo.
echo -- Table payment_logs
echo CREATE TABLE IF NOT EXISTS payment_logs (
echo   id SERIAL PRIMARY KEY,
echo   transaction_id VARCHAR(255^) UNIQUE NOT NULL,
echo   order_id UUID,
echo   user_id INTEGER,
echo   payment_method VARCHAR(50^) NOT NULL,
echo   provider VARCHAR(50^),
echo   amount DECIMAL(10, 2^) NOT NULL,
echo   currency VARCHAR(3^) DEFAULT 'EUR',
echo   amount_eur DECIMAL(10, 2^),
echo   amount_usd DECIMAL(10, 2^),
echo   amount_cdf DECIMAL(12, 2^),
echo   status VARCHAR(50^) DEFAULT 'pending',
echo   ip_address VARCHAR(45^),
echo   user_agent TEXT,
echo   metadata JSONB,
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^);
echo.
echo CREATE INDEX IF NOT EXISTS idx_payment_order_id ON payment_logs(order_id^);
echo CREATE INDEX IF NOT EXISTS idx_payment_user_id ON payment_logs(user_id^);
echo.
echo -- Table currency_rates
echo CREATE TABLE IF NOT EXISTS currency_rates (
echo   id SERIAL PRIMARY KEY,
echo   base_currency VARCHAR(3^) DEFAULT 'EUR',
echo   target_currency VARCHAR(3^) NOT NULL,
echo   rate DECIMAL(12, 6^) NOT NULL,
echo   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
echo   UNIQUE(base_currency, target_currency^)
echo ^);
echo.
echo INSERT INTO currency_rates (base_currency, target_currency, rate^) 
echo VALUES 
echo   ('EUR', 'USD', 1.08^),
echo   ('EUR', 'CDF', 3000.00^),
echo   ('USD', 'EUR', 0.93^),
echo   ('USD', 'CDF', 2780.00^),
echo   ('CDF', 'EUR', 0.00033^),
echo   ('CDF', 'USD', 0.00036^)
echo ON CONFLICT (base_currency, target_currency^) DO NOTHING;
echo.
echo -- Table user_sessions
echo CREATE TABLE IF NOT EXISTS user_sessions (
echo   id SERIAL PRIMARY KEY,
echo   user_id INTEGER REFERENCES users(id^) ON DELETE CASCADE,
echo   session_token VARCHAR(255^) UNIQUE NOT NULL,
echo   ip_address VARCHAR(45^),
echo   user_agent TEXT,
echo   country VARCHAR(100^),
echo   city VARCHAR(100^),
echo   is_active BOOLEAN DEFAULT TRUE,
echo   last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^);
echo.
echo -- Table admin_notifications
echo CREATE TABLE IF NOT EXISTS admin_notifications (
echo   id SERIAL PRIMARY KEY,
echo   type VARCHAR(50^) NOT NULL,
echo   title VARCHAR(255^) NOT NULL,
echo   message TEXT NOT NULL,
echo   severity VARCHAR(20^) DEFAULT 'info',
echo   is_read BOOLEAN DEFAULT FALSE,
echo   metadata JSONB,
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^);
echo.
echo -- Ajouter colonnes multi-devises à orders
echo DO $$ 
echo BEGIN
echo   IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='currency'^) THEN
echo     ALTER TABLE orders ADD COLUMN currency VARCHAR(3^) DEFAULT 'EUR';
echo   END IF;
echo   IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='amount_eur'^) THEN
echo     ALTER TABLE orders ADD COLUMN amount_eur DECIMAL(10, 2^);
echo   END IF;
echo   IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='amount_usd'^) THEN
echo     ALTER TABLE orders ADD COLUMN amount_usd DECIMAL(10, 2^);
echo   END IF;
echo   IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='amount_cdf'^) THEN
echo     ALTER TABLE orders ADD COLUMN amount_cdf DECIMAL(12, 2^);
echo   END IF;
echo END $$;
echo.
echo -- Ajouter colonne preferred_currency à users
echo DO $$ 
echo BEGIN
echo   IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='preferred_currency'^) THEN
echo     ALTER TABLE users ADD COLUMN preferred_currency VARCHAR(3^) DEFAULT 'EUR';
echo   END IF;
echo END $$;
) > temp_migrations.sql

REM Exécuter le fichier SQL
psql -U postgres -d tinaboutique -f temp_migrations.sql

if errorlevel 1 (
    echo.
    echo ❌ Erreur lors de la création des tables !
    del temp_migrations.sql
    pause
    exit /b 1
)

del temp_migrations.sql

echo.
echo ✅ Toutes les tables ont été créées avec succès !
echo.
echo 📊 Tables créées:
echo    ✓ activity_logs (traçabilité complète^)
echo    ✓ payment_logs (historique paiements^)
echo    ✓ currency_rates (taux de change^)
echo    ✓ user_sessions (sessions utilisateur^)
echo    ✓ admin_notifications (alertes admin^)
echo.
echo 🎯 Colonnes ajoutées:
echo    ✓ orders.currency, amount_eur, amount_usd, amount_cdf
echo    ✓ users.preferred_currency
echo.
echo 💡 Prochaines étapes:
echo    1. Redémarrer le serveur: npm run dev
echo    2. Aller sur http://localhost:8080/admin
echo    3. Vérifier le nouveau dashboard et logs
echo.
echo 🎉 Système de traçabilité opérationnel !
echo.
pause
