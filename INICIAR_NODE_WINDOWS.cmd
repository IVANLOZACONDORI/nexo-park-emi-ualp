@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Instale Node.js 20 o superior antes de iniciar.
 pause
 exit /b 1
)
if not exist "backend\.env" copy "backend\.env.example" "backend\.env" >nul
if not exist "backend\node_modules\express" (
 call npm --prefix backend ci
 if errorlevel 1 (
  echo No se pudieron instalar las dependencias. Revise su conexion a Internet.
  pause
  exit /b 1
 )
)
echo NEXO PARK V32 - Portal y sistema interno
echo PostgreSQL debe estar iniciado y DATABASE_URL debe apuntar a su base existente.
echo Cuando aparezca el mensaje de arranque, abra http://localhost:4000/login
echo No cierre esta ventana mientras usa el sistema.
call npm start
pause
