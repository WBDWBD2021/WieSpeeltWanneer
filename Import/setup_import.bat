@echo off
REM Tennis Team Manager - KNLTB Import Setup Script (Windows)
REM Dit script installeert de import functionaliteit

echo.
echo ====================================================
echo    Tennis Team Manager - KNLTB Import Setup
echo ====================================================
echo.

REM Controleer of we in de juiste directory zijn
if not exist "backend" (
    if not exist "frontend" (
        echo [ERROR] Dit script moet uitgevoerd worden in de root directory van het project
        echo         ^(waar zowel 'backend' als 'frontend' folders aanwezig zijn^)
        pause
        exit /b 1
    )
)

echo [OK] Project root gevonden
echo.

REM Backend setup
echo ====================================================
echo    Backend Setup
echo ====================================================
echo.

REM Maak directories
if not exist "backend\controllers" mkdir backend\controllers
if not exist "backend\routes" mkdir backend\routes

REM Kopieer bestanden
echo Kopieren van importController.js...
if exist "importController.js" (
    copy /Y importController.js backend\controllers\ >nul
    echo [OK] importController.js gekopieerd
) else (
    echo [WAARSCHUWING] importController.js niet gevonden
)

echo Kopieren van importRoutes.js...
if exist "importRoutes.js" (
    copy /Y importRoutes.js backend\routes\ >nul
    echo [OK] importRoutes.js gekopieerd
) else (
    echo [WAARSCHUWING] importRoutes.js niet gevonden
)

echo Kopieren van knltb_scraper.py...
if exist "knltb_scraper.py" (
    copy /Y knltb_scraper.py backend\ >nul
    echo [OK] knltb_scraper.py gekopieerd
) else (
    echo [WAARSCHUWING] knltb_scraper.py niet gevonden
)

echo.

REM Check backend/index.js
if exist "backend\index.js" (
    echo Controleren backend\index.js...
    findstr /C:"importRoutes" backend\index.js >nul
    if errorlevel 1 (
        echo.
        echo [WAARSCHUWING] Je moet handmatig de volgende regels toevoegen aan backend\index.js:
        echo.
        echo    Bij de andere require statements:
        echo    const importRoutes = require^('./routes/importRoutes'^);
        echo.
        echo    Bij de andere app.use statements:
        echo    app.use^('/api', importRoutes^);
        echo.
    ) else (
        echo [OK] backend\index.js is al geconfigureerd
    )
)

echo.

REM Python dependencies
echo ====================================================
echo    Python Dependencies
echo ====================================================
echo.
echo Installeren van Python packages...

where python >nul 2>nul
if %errorlevel% equ 0 (
    python -m pip install requests beautifulsoup4 >nul 2>nul
    echo [OK] Python dependencies geinstalleerd
) else (
    echo [WAARSCHUWING] Python niet gevonden. Installeer handmatig:
    echo    python -m pip install requests beautifulsoup4
)

echo.

REM Frontend setup
echo ====================================================
echo    Frontend Setup
echo ====================================================
echo.

REM Maak directories
if not exist "frontend\src\components" mkdir frontend\src\components

REM Kopieer bestanden
echo Kopieren van ImportDialog.tsx...
if exist "ImportDialog.tsx" (
    copy /Y ImportDialog.tsx frontend\src\components\ >nul
    echo [OK] ImportDialog.tsx gekopieerd
) else (
    echo [WAARSCHUWING] ImportDialog.tsx niet gevonden
)

REM Update api.ts
if exist "api_updated.ts" (
    echo Kopieren van api_updated.ts...
    copy /Y api_updated.ts frontend\src\services\api.ts >nul
    echo [OK] api.ts bijgewerkt
)

echo.
echo [OK] Bestanden gekopieerd
echo.

REM Handmatige stappen
echo ====================================================
echo    HANDMATIGE STAPPEN VEREIST
echo ====================================================
echo.
echo Je moet de volgende wijzigingen handmatig aanbrengen in:
echo.
echo    frontend\src\pages\Matches.tsx
echo.
echo 1. Voeg import toe bovenaan:
echo    import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
echo    import ImportDialog from '../components/ImportDialog';
echo.
echo 2. Voeg state toe in de component:
echo    const [importDialogOpen, setImportDialogOpen] = useState^(false^);
echo.
echo 3. Voeg knop toe in de toolbar ^(naast 'Nieuwe Wedstrijd'^):
echo    ^<Button
echo      variant="outlined"
echo      color="primary"
echo      startIcon={^<CloudDownloadIcon /^>}
echo      onClick={^(^) =^> setImportDialogOpen^(true^)}
echo      sx={{ mr: 1 }}
echo    ^>
echo      Importeren
echo    ^</Button^>
echo.
echo 4. Voeg dialog toe onderaan de component:
echo    ^<ImportDialog
echo      open={importDialogOpen}
echo      onClose={^(^) =^> setImportDialogOpen^(false^)}
echo      onSuccess={laadWedstrijden}
echo    /^>
echo.
echo ====================================================
echo.
echo Zie IMPORT_README.md voor gedetailleerde instructies
echo.
echo Start de applicatie opnieuw om de wijzigingen te gebruiken
echo.
echo Setup compleet!
echo.
pause
