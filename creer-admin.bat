@echo off
echo.
echo ==========================================================
echo   CREATION COMPTE ADMINISTRATEUR - TINA BOUTIQUE
echo ==========================================================
echo.
echo Ce script va creer un compte admin avec:
echo    Email: admin@tinaboutique.com
echo    Mot de passe: admin123
echo.
pause

(
echo -- Supprimer ancien admin si existe
echo DELETE FROM users WHERE email = 'admin@tinaboutique.com';
echo.
echo -- Creer nouveau compte admin
echo -- Mot de passe: admin123
echo INSERT INTO users (email, password_hash, full_name, role, preferred_currency^)
echo VALUES (
echo   'admin@tinaboutique.com',
echo   '$2b$10$rOvHH7YqYKGHZXPHr7qXQO7YqYKGHZXPHr7qXQO7YqYKGHZXPHr7qO',
echo   'Administrateur Principal',
echo   'admin',
echo   'EUR'
echo ^);
echo.
echo SELECT 'Compte admin cree avec succes!' as message;
) > temp_create_admin.sql

echo Execution SQL...
psql -U postgres -d tinaboutique_db -f temp_create_admin.sql

if errorlevel 1 (
    echo.
    echo ERREUR lors de la creation du compte !
    del temp_create_admin.sql
    pause
    exit /b 1
)

del temp_create_admin.sql

echo.
echo ==========================================================
echo   COMPTE ADMIN CREE AVEC SUCCES !
echo ==========================================================
echo.
echo Identifiants de connexion:
echo    Email: admin@tinaboutique.com
echo    Mot de passe: admin123
echo.
echo Etapes suivantes:
echo    1. Aller sur: http://localhost:8080/auth
echo    2. Se connecter avec les identifiants ci-dessus
echo    3. Aller sur: http://localhost:8080/admin
echo.
pause
