-- Données d'exemple pour remplir la base de données

-- Insérer un utilisateur admin
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@tinaboutique.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrateur', 'admin') -- Mot de passe: password
ON CONFLICT (email) DO NOTHING;

-- Insérer plus de catégories (éviter les doublons)
INSERT INTO categories (name, description) VALUES
('Femmes', 'Vêtements et accessoires pour femmes.'),
('Hommes', 'Vêtements et accessoires pour hommes.'),
('Accessoires', 'Sacs, bijoux et autres accessoires.')
ON CONFLICT (name) DO NOTHING;

-- Insérer des produits d'exemple
INSERT INTO products (category_id, name, description, price_eur, price_usd, price_cdf, stock_quantity, images, is_active) VALUES
-- Femmes
(1, 'Robe d''ete fleurie', 'Robe legere parfaite pour les journees ensoleillees.', 45.99, 49.99, 250000.00, 20, ARRAY['/image/product-f-1.webp'], true),
(1, 'Robe cocktail noire', 'Robe elegante pour occasions speciales.', 89.99, 98.99, 500000.00, 15, ARRAY['/image/product-f-2.webp'], true),
(1, 'Robe boheme', 'Robe fluide avec motifs ethniques.', 65.50, 72.05, 360000.00, 12, ARRAY['/image/product-f-3.webp'], true),
(1, 'Robe de soiree rouge', 'Robe glamour pour soirees.', 120.00, 132.00, 660000.00, 8, ARRAY['/image/product-f-4.webp'], true),
(1, 'Robe casual denim', 'Robe confortable en jean.', 55.99, 61.59, 308000.00, 18, ARRAY['/image/product-f-5.webp'], true),
(1, 'Robe maxi blanche', 'Robe longue elegante.', 75.00, 82.50, 412500.00, 10, ARRAY['/image/product-f-6.webp'], true),
(1, 'Robe a pois', 'Robe retro avec pois noirs.', 52.99, 58.29, 291500.00, 14, ARRAY['/image/product-f-7.webp'], true),
(1, 'Robe asymetrique', 'Robe moderne avec coupe asymetrique.', 68.50, 75.35, 376750.00, 11, ARRAY['/image/product-f-8.webp'], true),

-- Hommes
(2, 'Chemise slim fit', 'Chemise ajustée pour homme moderne.', 39.99, 43.99, 220000.00, 25, ARRAY['/image/product-m-1.webp'], true),
(2, 'Pantalon chino', 'Pantalon confortable en coton.', 49.99, 54.99, 275000.00, 20, ARRAY['/image/product-m-2.webp'], true),
(2, 'Veste casual', 'Veste légère pour toutes occasions.', 79.99, 87.99, 440000.00, 15, ARRAY['/image/product-m-3.webp'], true),
(2, 'Pull col roulé', 'Pull chaud en laine mérinos.', 59.99, 65.99, 330000.00, 18, ARRAY['/image/product-m-4.webp'], true),
(2, 'Jean slim', 'Jean ajusté tendance.', 69.99, 76.99, 385000.00, 22, ARRAY['/image/product-m-5.webp'], true),
(2, 'T-shirt basique', 'T-shirt coton bio.', 19.99, 21.99, 110000.00, 30, ARRAY['/image/product-m-6.webp'], true),
(2, 'Blazer elegant', 'Blazer pour occasions formelles.', 99.99, 109.99, 550000.00, 12, ARRAY['/image/product-m-7.webp'], true),
(2, 'Short d''ete', 'Short confortable en lin.', 35.99, 39.59, 198000.00, 16, ARRAY['/image/product-m-8.webp'], true),

-- Enfants
(3, 'Robe princesse', 'Robe magique pour petites princesses.', 29.99, 32.99, 165000.00, 20, ARRAY['/image/product-1.webp'], true),
(3, 'Ensemble garcon', 'Short et polo assortis.', 24.99, 27.49, 137500.00, 25, ARRAY['/image/product-2.webp'], true),
(3, 'Pyjama licorne', 'Pyjama doux avec licornes.', 19.99, 21.99, 110000.00, 15, ARRAY['/image/product-3.webp'], true),
(3, 'Veste enfant', 'Veste chaude pour l''hiver.', 34.99, 38.49, 192500.00, 18, ARRAY['/image/product-4.webp'], true),

-- Accessoires
(4, 'Sac a main', 'Sac elegant en cuir synthetique.', 45.99, 50.59, 253000.00, 12, ARRAY['/image/product-bag-1.jpg'], true),
(4, 'Ceinture femme', 'Ceinture en cuir veritable.', 25.99, 28.59, 143000.00, 20, ARRAY['/image/product-accessories-1.jpg'], true),
(4, 'Manteau hiver', 'Manteau chaud et style.', 149.99, 164.99, 825000.00, 8, ARRAY['/image/product-coat-1.jpg'], true),
(4, 'Robe de mariee', 'Robe blanche pour le grand jour.', 299.99, 329.99, 1650000.00, 3, ARRAY['/image/product-dress-1.jpg'], true);

-- Insérer quelques codes promo
INSERT INTO promo_codes (code, discount_percentage, is_active, valid_until) VALUES
('WELCOME10', 10.00, true, '2025-12-31 23:59:59'),
('SUMMER20', 20.00, true, '2025-08-31 23:59:59'),
('FLASH15', 15.00, true, '2025-10-15 23:59:59')
ON CONFLICT (code) DO NOTHING;