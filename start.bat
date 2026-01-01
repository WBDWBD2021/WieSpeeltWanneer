@echo off
echo Tennis Team Manager - Start Script
echo ===============================

REM Controleer en stop bestaande Node.js processen op poort 3000 (backend)
echo Controleer bestaande backend server...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Stop backend server met PID: %%a
    taskkill /F /Y /PID %%a 2>nul
)

REM Controleer en stop bestaande Node.js processen op poort 3001 (frontend)
echo Controleer bestaande frontend server...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Stop frontend server met PID: %%a
    taskkill /F /Y /PID %%a 2>nul
)

REM Wacht even om zeker te zijn dat de poorten vrij zijn
timeout /t 2 /nobreak > nul

REM Start MongoDB als deze nog niet draait
echo Controleer MongoDB...
sc query MongoDB > nul
if errorlevel 1 (
    echo MongoDB service niet gevonden. Controleer of MongoDB is geïnstalleerd.
    pause
    exit /b 1
)

REM Start MongoDB service als deze niet draait
sc query MongoDB | find "RUNNING" > nul
if errorlevel 1 (
    echo Start MongoDB service...
    net start MongoDB
    if errorlevel 1 (
        echo Kon MongoDB service niet starten.
        pause
        exit /b 1
    )
)

REM Installeer backend dependencies
echo Installeer backend dependencies...
call npm install
if errorlevel 1 (
    echo Fout bij installeren backend dependencies.
    pause
    exit /b 1
)
call npm audit fix

REM Installeer frontend dependencies
echo Installeer frontend dependencies...
cd client
call npm install
if errorlevel 1 (
    echo Fout bij installeren frontend dependencies.
    pause
    exit /b 1
)
echo Voer beveiligingsupdates uit...
call npm audit fix
if errorlevel 1 (
    echo Waarschuwing: Sommige beveiligingsupdates konden niet automatisch worden toegepast.
    echo Dit is normaal en heeft geen invloed op de functionaliteit.
    timeout /t 3 /nobreak > nul
)
cd ..

REM Start de backend server
echo Start backend server op poort 3000...
start "Tennis Manager Backend" cmd /k "set PORT=3000 && npm start"

REM Wacht even om zeker te zijn dat de backend is opgestart
echo Wacht tot backend server is opgestart...
timeout /t 5 /nobreak > nul

REM Start de frontend server op poort 3001
echo Start frontend server op poort 3001...
start "Tennis Manager Frontend" cmd /k "cd client && set PORT=3001 && npm start"

echo.
echo Applicatie wordt gestart...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3001
echo.
echo Let op: De servers hebben even nodig om op te starten.
echo Als de pagina's niet direct laden, wacht dan even en ververs de browser.
echo.
echo Druk op een toets om dit venster te sluiten...
pause > nul 