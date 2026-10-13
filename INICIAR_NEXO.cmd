@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (echo Instale Node.js para iniciar NEXO PARK. & pause & exit /b 1)
call npm --prefix backend ci
if errorlevel 1 (echo No se pudieron instalar las dependencias. & pause & exit /b 1)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\iniciar-windows.ps1"
pause
