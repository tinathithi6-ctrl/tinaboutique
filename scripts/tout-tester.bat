@echo off
color 0A
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║  SCRIPT DE TEST COMPLET - TINABOUTIQUE  ║
echo  ╚══════════════════════════════════════════╝
echo.

cd /d "%~dp0.."

echo [ETAPE 1] Verification des fichiers critiques...
echo.

if exist "src\components\Header.tsx" (
    echo [OK] Header.tsx existe
) else (
    echo [ERREUR] Header.tsx manquant!
)

if exist "src\App.tsx" (
    echo [OK] App.tsx existe
) else (
    echo [ERREUR] App.tsx manquant!
)

if exist "src\pages\ProductDetails.tsx" (
    echo [OK] ProductDetails.tsx existe
) else (
    echo [ERREUR] ProductDetails.tsx manquant!
)

if exist "src\pages\Shop.tsx" (
    echo [OK] Shop.tsx existe
) else (
    echo [ERREUR] Shop.tsx manquant!
)

if exist ".gitignore" (
    echo [OK] .gitignore existe
) else (
    echo [ERREUR] .gitignore manquant!
)

if exist "database_indexes.sql" (
    echo [OK] database_indexes.sql existe
) else (
    echo [ERREUR] database_indexes.sql manquant!
)

echo.
echo [ETAPE 2] Verification de .env dans .gitignore...
findstr /C:".env" .gitignore >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] .env est protege dans .gitignore
) else (
    echo [AVERTISSEMENT] .env n'est pas dans .gitignore!
)

echo.
echo [ETAPE 3] Verification des dependencies...
if exist "node_modules" (
    echo [OK] node_modules existe
) else (
    echo [AVERTISSEMENT] node_modules manquant - Executez: npm install
)

echo.
echo [ETAPE 4] Verification de la compilation TypeScript...
echo Compilation en cours...
call npm run build >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Compilation TypeScript reussie
) else (
    echo [AVERTISSEMENT] Erreurs de compilation detectees
    echo Executez "npm run dev" pour voir les details
)

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║           RESUME DES TESTS               ║
echo  ╚══════════════════════════════════════════╝
echo.
echo  Pour tester l'application completement:
echo.
echo  1. Demarrez l'application:
echo     npm run dev
echo.
echo  2. Ouvrez: http://localhost:8081
echo.
echo  3. Testez:
echo     - Badge panier s'incremente
echo     - Icone panier cliquable
echo     - Recherche accessible
echo     - Admin peut naviguer
echo     - Panier sans connexion
echo.
echo  Consultez: GUIDE-MANUEL-FINAL.md
echo.
pause
