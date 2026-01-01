@echo off
echo ===================================================
echo   Tennis Team Manager - Mobiele Modus (Windows)
echo ===================================================
echo.
echo BELANGRIJK: Sluit eerst eventuele andere zwarte schermpjes (terminals).
echo Anders kan de server niet starten omdat de poort al bezet is.
echo.
pause
echo.
echo [1/2] Backend starten (Server)...
start "TTM Server" npm start
echo.
echo [2/2] Frontend server starten (App)...
echo.
echo ===================================================
echo   OPEN DIT OP JE IPHONE (Safari):
echo   http://192.168.178.183:5000
echo.
echo   Klik daarna in Safari op 'Deel' -> 'Zet op beginscherm'
echo   En je hebt je app!
echo ===================================================
echo.
cd client
call npx serve -s build -l 5000
pause
