@echo off
echo ============================================
echo VERIFICATION BASE DE DONNEES - TINABOUTIQUE
echo ============================================
echo.

SET DB_NAME=tinaboutique_db
SET DB_USER=tinaboutique_user

echo Base de donnees: %DB_NAME%
echo Utilisateur: %DB_USER%
echo Mot de passe par defaut: abcd1234
echo.

echo [1/6] Liste des tables...
echo ----------------------------------------
psql -U %DB_USER% -d %DB_NAME% -c "\dt"
echo.

echo [2/6] Nombre de produits...
echo ----------------------------------------
psql -U %DB_USER% -d %DB_NAME% -c "SELECT COUNT(*) as total_produits FROM products;"
echo.

echo [3/6] Liste des produits...
echo ----------------------------------------
psql -U %DB_USER% -d %DB_NAME% -c "SELECT id, name, category_id, price_eur, stock_quantity, is_active FROM products LIMIT 10;"
echo.

echo [4/6] Nombre de categories...
echo ----------------------------------------
psql -U %DB_USER% -d %DB_NAME% -c "SELECT COUNT(*) as total_categories FROM categories;"
echo.

echo [5/6] Liste des categories...
echo ----------------------------------------
psql -U %DB_USER% -d %DB_NAME% -c "SELECT id, name FROM categories;"
echo.

echo [6/6] Nombre d'utilisateurs...
echo ----------------------------------------
psql -U %DB_USER% -d %DB_NAME% -c "SELECT COUNT(*) as total_users FROM users;"
echo.

echo ============================================
echo VERIFICATION TERMINEE!
echo ============================================
echo.
pause
