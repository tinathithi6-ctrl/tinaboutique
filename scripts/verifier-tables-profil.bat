@echo off
echo ============================================
echo VERIFICATION TABLES POUR PROFIL
echo ============================================
echo.

SET DB_NAME=tinaboutique_db
SET DB_USER=tinaboutique_user

echo [1/3] Verification table USERS...
echo ----------------------------------------
psql -U %DB_USER% -d %DB_NAME% -c "\d users"
echo.

echo [2/3] Verification table ORDERS...
echo ----------------------------------------
psql -U %DB_USER% -d %DB_NAME% -c "\d orders"
echo.

echo [3/3] Test requete statistiques...
echo ----------------------------------------
echo Test pour user_id (remplacer par votre ID):
psql -U %DB_USER% -d %DB_NAME% -c "SELECT COUNT(*) as total_commandes, COALESCE(SUM(total_amount), 0) as total_depense FROM orders WHERE user_id = (SELECT id FROM users LIMIT 1);"
echo.

echo ============================================
echo VERIFICATION TERMINEE!
echo ============================================
echo.
echo Resultat: Si vous voyez les colonnes ci-dessus,
echo TOUT FONCTIONNE ! Aucune table a creer.
echo.
pause
