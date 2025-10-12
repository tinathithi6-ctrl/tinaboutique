@echo off
echo ============================================
echo GENERATION DE SECRETS SECURISES
echo ============================================
echo.

echo Generating JWT_SECRET...
powershell -Command "[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))"
echo.

echo Generating ENCRYPTION_KEY...
powershell -Command "[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))"
echo.

echo ============================================
echo COPIEZ CES SECRETS DANS VOTRE .env
echo ============================================
echo.
pause
