-- Supprime les anciennes tables si elles existent pour éviter les conflits.
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS promotions;
DROP TABLE IF EXISTS promo_codes;
DROP TABLE IF EXISTS users;


-- Table pour les utilisateurs
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'customer' NOT NULL, -- 'customer' ou 'admin'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les catégories de produits
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les produits
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_eur NUMERIC(10, 2) NOT NULL,
    price_usd NUMERIC(10, 2) NOT NULL,
    price_cdf NUMERIC(10, 2) NOT NULL,
    -- Champs pour les promotions intégrées
    sale_price_eur NUMERIC(10, 2), -- Prix promotionnel EUR (NULL = pas de promo)
    sale_price_usd NUMERIC(10, 2), -- Prix promotionnel USD
    sale_price_cdf NUMERIC(10, 2), -- Prix promotionnel CDF
    sale_start_date TIMESTAMPTZ, -- Date de début de la promotion
    sale_end_date TIMESTAMPTZ, -- Date de fin de la promotion
    -- Champs pour les réductions par quantité
    bulk_discount_threshold INTEGER, -- Seuil de quantité pour réduction (ex: 3 articles)
    bulk_discount_percentage NUMERIC(5, 2), -- Pourcentage de réduction par quantité
    stock_quantity INTEGER DEFAULT 0,
    images TEXT[], -- Tableau d'URLs pour les images du produit
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les promotions et les soldes
CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    discount_percentage NUMERIC(5, 2),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

-- Table pour les codes promo
CREATE TABLE promo_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_percentage NUMERIC(5, 2),
    is_active BOOLEAN DEFAULT true,
    valid_until TIMESTAMPTZ
);

-- Table pour les commandes (mise à jour)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    total_amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    shipping_address JSONB,
    customer_info JSONB
);

-- Table pour les paniers persistants
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Table pour les articles de commande (mise à jour)
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    image_url TEXT
);

-- Créer un trigger pour mettre à jour 'updated_at' automatiquement
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Insérer quelques catégories pour commencer
INSERT INTO categories (name, description) VALUES
('Robes', 'Collection de robes pour toutes les occasions.'),
('Homme', 'Vêtements et accessoires pour hommes.'),
('Enfants', 'Vêtements confortables et ludiques pour enfants.'),
('Accessoires', 'Sacs, ceintures, et autres accessoires pour compléter votre look.');
