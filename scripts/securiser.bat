@echo off
echo ============================================
echo SCRIPT DE SECURISATION - TINABOUTIQUE
echo ============================================
echo.

cd /d "%~dp0.."

echo [1/3] Retrait de .env du Git...
git rm --cached .env 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] .env retire du Git
) else (
    echo [INFO] .env n'etait pas tracke ou deja retire
)

echo.
echo [2/3] Ajout de .gitignore...
git add .gitignore
if %ERRORLEVEL% EQU 0 (
    echo [OK] .gitignore ajoute
) else (
    echo [ERREUR] Impossible d'ajouter .gitignore
)

echo.
echo [3/3] Commit des changements...
git commit -m "security: Protect .env file and sensitive data"
if %ERRORLEVEL% EQU 0 (
    echo [OK] Changements commites
) else (
    echo [INFO] Rien a commiter ou erreur
)

echo.
echo ============================================
echo [OK] SECURISATION TERMINEE!
echo ============================================
echo.
echo ACTIONS MANUELLES REQUISES:
echo 1. Revoquer cles AWS: AKIAVJZSZOP62D2BVEUJ
echo    https://console.aws.amazon.com/iam/
echo.
echo 2. Generer nouveaux secrets:
echo    - JWT_SECRET
echo    - ENCRYPTION_KEY
echo    - DB_PASSWORD
echo.
echo 3. Mettre a jour .env avec les nouvelles valeurs
echo.
pause
