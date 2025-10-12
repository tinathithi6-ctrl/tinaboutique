@echo off
echo.
echo ==========================================================
echo   CREATION TABLES DE BASE - TINABOUTIQUE
echo ==========================================================
echo.

(
echo -- Table users
echo CREATE TABLE IF NOT EXISTS users (
echo   id SERIAL PRIMARY KEY,
echo   email VARCHAR(255^) UNIQUE NOT NULL,
echo   password_hash VARCHAR(255^) NOT NULL,
echo   full_name VARCHAR(255^),
echo   role VARCHAR(50^) DEFAULT 'user',
echo   preferred_currency VARCHAR(3^) DEFAULT 'EUR',
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^);
echo.
echo -- Table categories
echo CREATE TABLE IF NOT EXISTS categories (
echo   id SERIAL PRIMARY KEY,
echo   name VARCHAR(255^) NOT NULL,
echo   description TEXT,
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^);
echo.
echo -- Table products
echo CREATE TABLE IF NOT EXISTS products (
echo   id SERIAL PRIMARY KEY,
echo   name VARCHAR(255^) NOT NULL,
echo   description TEXT,
echo   price_eur DECIMAL(10,2^) NOT NULL,
echo   price_usd DECIMAL(10,2^),
echo   price_cdf DECIMAL(12,2^),
echo   stock INTEGER DEFAULT 0,
echo   category_id INTEGER REFERENCES categories(id^),
echo   images TEXT[],
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^);
echo.
echo -- Table orders
echo CREATE TABLE IF NOT EXISTS orders (
echo   id UUID PRIMARY KEY DEFAULT gen_random_uuid(^),
echo   user_id INTEGER REFERENCES users(id^),
echo   total_amount DECIMAL(10,2^) NOT NULL,
echo   currency VARCHAR(3^) DEFAULT 'EUR',
echo   amount_eur DECIMAL(10,2^),
echo   amount_usd DECIMAL(10,2^),
echo   amount_cdf DECIMAL(12,2^),
echo   status VARCHAR(50^) DEFAULT 'pending',
echo   full_name VARCHAR(255^),
echo   email VARCHAR(255^),
echo   address TEXT,
echo   city VARCHAR(100^),
echo   postal_code VARCHAR(20^),
echo   country VARCHAR(100^),
echo   phone VARCHAR(50^),
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^);
echo.
echo -- Table order_items
echo CREATE TABLE IF NOT EXISTS order_items (
echo   id SERIAL PRIMARY KEY,
echo   order_id UUID REFERENCES orders(id^),
echo   product_id INTEGER REFERENCES products(id^),
echo   quantity INTEGER NOT NULL,
echo   price DECIMAL(10,2^) NOT NULL,
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^);
echo.
echo -- Table cart_items
echo CREATE TABLE IF NOT EXISTS cart_items (
echo   id SERIAL PRIMARY KEY,
echo   user_id INTEGER REFERENCES users(id^),
echo   product_id INTEGER REFERENCES products(id^),
echo   quantity INTEGER DEFAULT 1,
echo   added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^);
echo.
echo -- Inserer categories par defaut
echo INSERT INTO categories (name, description^) VALUES
echo   ('Robes', 'Collection de robes elegantes'^),
echo   ('Accessoires', 'Sacs, ceintures et bijoux'^),
echo   ('Chaussures', 'Chaussures pour toutes occasions'^),
echo   ('Sacs', 'Sacs a main et sacs de voyage'^),
echo   ('Enfants', 'Vetements pour enfants'^),
echo   ('Homme', 'Vetements pour hommes'^)
echo ON CONFLICT DO NOTHING;
echo.
echo -- Inserer un utilisateur admin par defaut
echo INSERT INTO users (email, password_hash, full_name, role^) VALUES
echo   ('admin@tinaboutique.com', '$2b$10$YourHashedPasswordHere', 'Administrateur', 'admin'^)
echo ON CONFLICT (email^) DO NOTHING;
) > temp_base_tables.sql

echo Execution du fichier SQL...
psql -U postgres -d tinaboutique -f temp_base_tables.sql

if errorlevel 1 (
    echo.
    echo ERREUR lors de la creation des tables !
    del temp_base_tables.sql
    pause
    exit /b 1
)

del temp_base_tables.sql

echo.
echo ==========================================================
echo   SUCCES ! Tables de base creees !
echo ==========================================================
echo.
echo Tables creees:
echo    [OK] users
echo    [OK] categories
echo    [OK] products
echo    [OK] orders
echo    [OK] order_items
echo    [OK] cart_items
echo.
echo Categories par defaut inserees
echo Utilisateur admin cree
echo.
pause
