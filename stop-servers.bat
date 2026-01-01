@echo off
echo Stoppen van alle Node.js servers...

:: Vind en stop alle processen die op poort 3000 en 3001 draaien
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
    taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001"') do (
    taskkill /F /PID %%a 2>nul
)

:: Stop alle node.exe processen
taskkill /F /IM node.exe 2>nul

echo Servers gestopt!
pause 