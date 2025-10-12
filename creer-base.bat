@echo off
echo.
echo ==========================================================
echo   CREATION BASE DE DONNEES TINABOUTIQUE
echo ==========================================================
echo.

echo Tentative de creation de la base tinaboutique...
echo.

psql -U postgres -c "CREATE DATABASE tinaboutique;"

if errorlevel 1 (
    echo.
    echo La base existe peut-etre deja, ou erreur de connexion.
    echo Tentative de connexion a la base...
    echo.
    psql -U postgres -d tinaboutique -c "SELECT 1;"
    if errorlevel 1 (
        echo ERREUR: Impossible de se connecter a la base !
        pause
        exit /b 1
    ) else (
        echo SUCCES: La base tinaboutique existe et est accessible !
    )
) else (
    echo SUCCES: Base tinaboutique creee !
)

echo.
echo ==========================================================
echo   BASE DE DONNEES PRETE !
echo ==========================================================
echo.
echo Vous pouvez maintenant lancer: init-database.bat
echo.
pause
