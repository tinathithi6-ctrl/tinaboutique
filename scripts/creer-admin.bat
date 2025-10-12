@echo off
echo ============================================
echo PROMOUVOIR UTILISATEUR EN ADMIN
echo ============================================
echo.

SET DB_NAME=tinaboutique_db
SET DB_USER=tinaboutique_user

echo Base de donnees: %DB_NAME%
echo.

echo [1/3] Liste des utilisateurs actuels...
echo ----------------------------------------
psql -U %DB_USER% -d %DB_NAME% -c "SELECT email, role, created_at FROM users;"

echo.
echo [2/3] Promotion de odirussel@gmail.com en ADMIN...
echo ----------------------------------------
psql -U %DB_USER% -d %DB_NAME% -c "UPDATE users SET role = 'admin' WHERE email = 'odirussel@gmail.com';"

echo.
echo [3/3] Verification...
echo ----------------------------------------
psql -U %DB_USER% -d %DB_NAME% -c "SELECT email, role FROM users;"

echo.
echo ============================================
echo PROMOTION TERMINEE!
echo ============================================
echo.
echo Vous pouvez maintenant acceder a /admin avec:
echo Email: odirussel@gmail.com
echo.
pause
