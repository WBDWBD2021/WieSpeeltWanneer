@echo off
echo ===================================================
echo   Tennis Team Manager - Mobiele App Update
echo ===================================================
echo.
echo Dit script bouwt de frontend opnieuw en synchroniseert met de mobiele app.
echo Gebruik dit NADAT je de REACT_APP_API_URL in client/.env hebt aangepast.
echo.
pause
echo.
echo [1/2] React App Bouwen...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo Fout bij het bouwen van de React app!
    pause
    exit /b %errorlevel%
)
cd ..
echo.
echo [2/2] Capacitor Synchroniseren...
call npx cap sync
if %errorlevel% neq 0 (
    echo Fout bij het synchroniseren met Capacitor!
    pause
    exit /b %errorlevel%
)
echo.
echo ===================================================
echo   Klaar! Open nu Android Studio of Xcode om de app op je telefoon te zetten.
echo   Of draai: npx cap open android (of ios)
echo ===================================================
pause
