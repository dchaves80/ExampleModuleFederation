@echo off
echo ******************************************
echo *         DOCKER BUILD                  *
echo ******************************************
echo.
echo Iniciando servidores de desarrollo...
echo.
echo Host App: http://localhost:3000
echo Remote App 1: http://localhost:3001  
echo Remote App 2: http://localhost:3002
echo.

start "Host App" cmd /k "cd host-app && npm run dev"
timeout /t 2 /nobreak >nul
start "Remote App 1" cmd /k "cd remote-app-1 && npm run dev"
timeout /t 2 /nobreak >nul
start "Remote App 2" cmd /k "cd remote-app-2 && npm run dev"

echo.
echo Todos los servidores iniciados!
echo Presiona cualquier tecla para continuar...
pause >nul 