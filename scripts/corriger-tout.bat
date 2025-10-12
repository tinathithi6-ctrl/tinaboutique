@echo off
echo ============================================
echo CORRECTION COMPLETE BASE DE DONNEES
echo ============================================
echo.
echo Ce script va:
echo 1. Nettoyer les categories vides
echo 2. Appliquer les index de performance
echo 3. Promouvoir odirussel@gmail.com en admin
echo.
echo Appuyez sur Ctrl+C pour annuler, ou
pause

echo.
echo ==========================================
echo ETAPE 1/3: NETTOYAGE DES CATEGORIES
echo ==========================================
call "%~dp0nettoyer-categories.bat"

echo.
echo ==========================================
echo ETAPE 2/3: INDEX DE PERFORMANCE
echo ==========================================
call "%~dp0appliquer-index.bat"

echo.
echo ==========================================
echo ETAPE 3/3: CREATION ADMIN
echo ==========================================
call "%~dp0creer-admin.bat"

echo.
echo ============================================
echo TOUTES LES CORRECTIONS APPLIQUEES!
echo ============================================
echo.
echo Prochaines etapes:
echo 1. Demarrer l'application: npm run dev
echo 2. Tester sur http://localhost:8080
echo 3. Se connecter en admin sur /admin
echo.
pause
