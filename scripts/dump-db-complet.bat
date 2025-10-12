@echo off
echo ============================================
echo DUMP COMPLET BASE DE DONNEES
echo ============================================
echo.

SET DB_NAME=tinaboutique_db
SET DB_USER=tinaboutique_user

echo Base de donnees: %DB_NAME%
echo Utilisateur: %DB_USER%
echo.

echo ========== STRUCTURE DE LA BASE ==========
echo.
echo Liste de toutes les tables:
psql -U %DB_USER% -d %DB_NAME% -c "\dt"
echo.

echo ========== TABLE: CATEGORIES ==========
echo.
echo Structure:
psql -U %DB_USER% -d %DB_NAME% -c "\d categories"
echo.
echo Contenu:
psql -U %DB_USER% -d %DB_NAME% -c "SELECT * FROM categories;"
echo.

echo ========== TABLE: PRODUCTS ==========
echo.
echo Structure:
psql -U %DB_USER% -d %DB_NAME% -c "\d products"
echo.
echo Contenu (tous les produits):
psql -U %DB_USER% -d %DB_NAME% -c "SELECT id, name, category_id, price_eur, price_usd, price_cdf, stock_quantity, is_active FROM products;"
echo.
echo Images des produits:
psql -U %DB_USER% -d %DB_NAME% -c "SELECT id, name, images FROM products LIMIT 5;"
echo.

echo ========== TABLE: USERS ==========
echo.
echo Structure:
psql -U %DB_USER% -d %DB_NAME% -c "\d users"
echo.
echo Contenu (sans mots de passe):
psql -U %DB_USER% -d %DB_NAME% -c "SELECT id, email, role, created_at FROM users;"
echo.

echo ========== TABLE: ORDERS ==========
echo.
echo Structure:
psql -U %DB_USER% -d %DB_NAME% -c "\d orders"
echo.
echo Nombre de commandes:
psql -U %DB_USER% -d %DB_NAME% -c "SELECT COUNT(*) as total_orders FROM orders;"
echo.

echo ========== TABLE: ORDER_ITEMS ==========
echo.
echo Structure:
psql -U %DB_USER% -d %DB_NAME% -c "\d order_items"
echo.
echo Nombre d'articles commandés:
psql -U %DB_USER% -d %DB_NAME% -c "SELECT COUNT(*) as total_order_items FROM order_items;"
echo.

echo ========== STATISTIQUES ==========
echo.
echo Produits par catégorie:
psql -U %DB_USER% -d %DB_NAME% -c "SELECT c.name as categorie, COUNT(p.id) as nb_produits FROM categories c LEFT JOIN products p ON c.id = p.category_id GROUP BY c.id, c.name ORDER BY nb_produits DESC;"
echo.
echo Produits actifs vs inactifs:
psql -U %DB_USER% -d %DB_NAME% -c "SELECT is_active, COUNT(*) as nombre FROM products GROUP BY is_active;"
echo.
echo Prix moyen par catégorie:
psql -U %DB_USER% -d %DB_NAME% -c "SELECT c.name as categorie, ROUND(AVG(p.price_eur)::numeric, 2) as prix_moyen_eur FROM categories c LEFT JOIN products p ON c.id = p.category_id GROUP BY c.id, c.name;"
echo.

echo ========== INDEX EXISTANTS ==========
echo.
psql -U %DB_USER% -d %DB_NAME% -c "\di"
echo.

echo ============================================
echo DUMP TERMINE!
echo ============================================
echo.
echo Ce rapport montre TOUT le contenu de votre base de donnees.
echo.
pause
