@echo off
echo.
echo ==========================================================
echo   INITIALISATION SYSTEME TRACABILITE - TINA BOUTIQUE
echo ==========================================================
echo.
echo Ce script va creer toutes les tables necessaires dans:
echo    BASE: tinaboutique_db
echo.
echo    - Tracabilite complete (activity_logs)
echo    - Historique paiements (payment_logs)
echo    - Multi-devises (currency_rates)
echo    - Sessions utilisateur (user_sessions)
echo.
pause

echo.
echo Connexion a la base de donnees tinaboutique_db...
echo.

REM Creer le fichier SQL temporaire
(
echo -- Table activity_logs
echo CREATE TABLE IF NOT EXISTS activity_logs (
echo   id SERIAL PRIMARY KEY,
echo   user_id INTEGER,
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
echo   order_id VARCHAR(255^),
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
echo CREATE INDEX IF NOT EXISTS idx_payment_status ON payment_logs(status^);
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
echo   user_id INTEGER,
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
echo CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id^);
echo CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token^);
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
echo -- Ajouter colonnes multi-devises a orders si la table existe
echo DO $$ 
echo BEGIN
echo   IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='orders'^) THEN
echo     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='currency'^) THEN
echo       ALTER TABLE orders ADD COLUMN currency VARCHAR(3^) DEFAULT 'EUR';
echo     END IF;
echo     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='amount_eur'^) THEN
echo       ALTER TABLE orders ADD COLUMN amount_eur DECIMAL(10, 2^);
echo     END IF;
echo     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='amount_usd'^) THEN
echo       ALTER TABLE orders ADD COLUMN amount_usd DECIMAL(10, 2^);
echo     END IF;
echo     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='amount_cdf'^) THEN
echo       ALTER TABLE orders ADD COLUMN amount_cdf DECIMAL(12, 2^);
echo     END IF;
echo   END IF;
echo END $$;
echo.
echo -- Ajouter colonne preferred_currency a users si la table existe
echo DO $$ 
echo BEGIN
echo   IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='users'^) THEN
echo     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='preferred_currency'^) THEN
echo       ALTER TABLE users ADD COLUMN preferred_currency VARCHAR(3^) DEFAULT 'EUR';
echo     END IF;
echo   END IF;
echo END $$;
) > temp_migrations.sql

echo Execution du fichier SQL sur tinaboutique_db...
psql -U postgres -d tinaboutique_db -f temp_migrations.sql

if errorlevel 1 (
    echo.
    echo ERREUR lors de la creation des tables !
    del temp_migrations.sql
    pause
    exit /b 1
)

del temp_migrations.sql

echo.
echo ==========================================================
echo   SUCCES ! Toutes les tables ont ete creees !
echo ==========================================================
echo.
echo Tables creees dans tinaboutique_db:
echo    [OK] activity_logs (tracabilite complete)
echo    [OK] payment_logs (historique paiements)
echo    [OK] currency_rates (taux de change EUR/USD/CDF)
echo    [OK] user_sessions (sessions utilisateur)
echo    [OK] admin_notifications (alertes admin)
echo.
echo Colonnes ajoutees si tables existaient:
echo    [OK] orders: currency, amount_eur, amount_usd, amount_cdf
echo    [OK] users: preferred_currency
echo.
echo Prochaines etapes:
echo    1. Modifier .env: DB_NAME=tinaboutique_db
echo    2. Redemarrer le serveur: npm run dev
echo    3. Aller sur http://localhost:8080/admin
echo    4. Verifier le nouveau dashboard et logs
echo.
echo Systeme de tracabilite operationnel !
echo.
pause
