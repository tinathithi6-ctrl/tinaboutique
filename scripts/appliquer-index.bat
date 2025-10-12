@echo off
echo ============================================
echo APPLICATION DES INDEX BASE DE DONNEES
echo ============================================
echo.

cd /d "%~dp0.."

SET DB_NAME=tinaboutique_db
SET DB_USER=tinaboutique_user

echo Base de donnees: %DB_NAME%
echo Utilisateur: %DB_USER%
echo.
echo IMPORTANT: Le mot de passe par defaut est: abcd1234
echo (Changez-le apres pour plus de securite!)
echo.
echo Appuyez sur une touche pour continuer...
pause >nul

echo.
echo [1/1] Application des index...
psql -U %DB_USER% -d %DB_NAME% -f database_indexes.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo [OK] INDEX APPLIQUES AVEC SUCCES!
    echo ============================================
    echo.
    echo Verification des index:
    psql -U %DB_USER% -d %DB_NAME% -c "\di"
) else (
    echo.
    echo ============================================
    echo [ERREUR] Echec de l'application des index
    echo ============================================
    echo.
    echo Verifiez que:
    echo - PostgreSQL est demarre
    echo - Les informations de connexion sont correctes
    echo - Le fichier database_indexes.sql existe
)

echo.
pause
