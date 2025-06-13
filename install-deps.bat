@echo off
echo ******************************************
echo *        INSTALACION DEPENDENCIAS      *
echo ******************************************
echo.
echo Instalando dependencias para todos los modulos...
echo.

echo [1/4] Instalando dependencias del proyecto raiz...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias del proyecto raiz
    pause
    exit /b 1
)
echo ✅ Dependencias del proyecto raiz instaladas correctamente
echo.

echo [2/4] Instalando dependencias del Host App...
cd host-app
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias del Host App
    cd ..
    pause
    exit /b 1
)
echo ✅ Dependencias del Host App instaladas correctamente
cd ..
echo.

echo [3/4] Instalando dependencias del Remote App 1...
cd remote-app-1
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias del Remote App 1
    cd ..
    pause
    exit /b 1
)
echo ✅ Dependencias del Remote App 1 instaladas correctamente
cd ..
echo.

echo [4/4] Instalando dependencias del Remote App 2...
cd remote-app-2
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias del Remote App 2
    cd ..
    pause
    exit /b 1
)
echo ✅ Dependencias del Remote App 2 instaladas correctamente
cd ..
echo.

echo ******************************************
echo *          INSTALACION COMPLETA        *
echo ******************************************
echo.
echo ✅ Todas las dependencias han sido instaladas correctamente!
echo.
echo Puedes ejecutar los siguientes comandos:
echo   - start-dev.bat : Iniciar servidores de desarrollo
echo   - npm run dev   : Iniciar todos los servidores (requiere concurrently)
echo.
echo Presiona cualquier tecla para continuar...
pause >nul 