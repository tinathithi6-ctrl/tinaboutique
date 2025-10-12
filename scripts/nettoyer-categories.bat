@echo off
echo ============================================
echo NETTOYAGE DES CATEGORIES EN DOUBLON
echo ============================================
echo.

SET DB_NAME=tinaboutique_db
SET DB_USER=tinaboutique_user

echo ATTENTION: Ce script va:
echo 1. Supprimer les categories vides "Femmes" et "Hommes"
echo 2. Renommer "Homme" en "Hommes" si besoin
echo.
echo Appuyez sur Ctrl+C pour annuler, ou
pause

echo.
echo [1/3] Verification des categories vides...
psql -U %DB_USER% -d %DB_NAME% -c "SELECT c.id, c.name, COUNT(p.id) as nb_produits FROM categories c LEFT JOIN products p ON c.id = p.category_id GROUP BY c.id, c.name ORDER BY c.id;"

echo.
echo [2/3] Suppression des categories vides...
psql -U %DB_USER% -d %DB_NAME% -c "DELETE FROM categories WHERE id IN (9, 10);"

echo.
echo [3/3] Verification finale...
psql -U %DB_USER% -d %DB_NAME% -c "SELECT c.id, c.name, COUNT(p.id) as nb_produits FROM categories c LEFT JOIN products p ON c.id = p.category_id GROUP BY c.id, c.name ORDER BY c.id;"

echo.
echo ============================================
echo NETTOYAGE TERMINE!
echo ============================================
echo.
pause
