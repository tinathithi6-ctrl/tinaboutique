@echo off
REM Script de backup de la base de données TinaBoutique (Windows)
REM Assurez-vous que PostgreSQL bin est dans votre PATH

SET DB_NAME=tinaboutique_db
SET DB_USER=tinaboutique_user
SET BACKUP_DIR=backups
SET DATE_TIME=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%
SET BACKUP_FILE=%BACKUP_DIR%\backup_%DATE_TIME%.sql

REM Créer le dossier backups s'il n'existe pas
if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%

echo ============================================
echo Backup de la base de donnees TinaBoutique
echo ============================================
echo.
echo Date: %date% %time%
echo Destination: %BACKUP_FILE%
echo.

REM Effectuer le backup
pg_dump -U %DB_USER% -h localhost %DB_NAME% > %BACKUP_FILE%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [OK] Backup termine avec succes!
    echo Fichier: %BACKUP_FILE%
    
    REM Compression (nécessite 7-Zip ou WinRAR dans PATH)
    if exist "C:\Program Files\7-Zip\7z.exe" (
        echo.
        echo Compression du backup...
        "C:\Program Files\7-Zip\7z.exe" a -tgzip %BACKUP_FILE%.gz %BACKUP_FILE%
        del %BACKUP_FILE%
        echo [OK] Backup compresse: %BACKUP_FILE%.gz
    )
    
    REM Nettoyage (supprimer les backups de plus de 7 jours)
    echo.
    echo Nettoyage des anciens backups...
    forfiles /P %BACKUP_DIR% /M backup_*.gz /D -7 /C "cmd /c del @path" 2>nul
    
) else (
    echo.
    echo [ERREUR] Le backup a echoue!
    echo Verifiez:
    echo - PostgreSQL est installe et dans PATH
    echo - Les informations de connexion sont correctes
    echo - L'utilisateur a les permissions necessaires
)

echo.
echo ============================================
pause
