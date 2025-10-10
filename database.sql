CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255), -- Ou un type plus approprié si vous avez une gestion d'utilisateurs
    created_at TIMESTAMPTZ DEFAULT NOW(),
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    shipping_address JSONB,
    customer_info JSONB
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(255), -- Assurez-vous que cela correspond à l'ID de vos produits
    name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT
);
