@echo off
title Rishu Shop - Full Stack Local Server
echo ========================================================
echo        RISHU SHOP - FULL STACK SERVER LAUNCHER
echo ========================================================
echo.
echo [1/2] Starting Local PHP Backend Server on http://localhost:8000...
start "" /b "C:\Users\uttam\php\php.exe" -S 127.0.0.1:8000 -t "%~dp0"
timeout /t 2 /nobreak >nul
echo [2/2] Opening Rishu Shop in your default browser...
start http://localhost:8000/index.html
echo.
echo ========================================================
echo Server is running! Press any key or close this window to stop.
echo ========================================================
pause
