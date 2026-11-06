@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
set "PORTA_APP=%~1"
if "%PORTA_APP%"=="" set "PORTA_APP=3000"
title AgroSmart - Bridge Serial (Arduino)

where node >nul 2>&1
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado.
  echo Instale o Node.js 20 ou superior em https://nodejs.org
  pause
  exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
  echo [ERRO] npm nao encontrado.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Instalando dependencias do bridge...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo [ERRO] Falha ao instalar as dependencias.
    pause
    exit /b 1
  )
)

set "ESTUFA_TOKEN="
if exist "..\..\.env.local" (
  for /f "usebackq tokens=1,* delims==" %%A in (`findstr /b /c:"ESTUFA_TOKEN=" "..\..\.env.local"`) do set "ESTUFA_TOKEN=%%~B"
)

echo.
echo ============================================================
echo   AGROSMART - BRIDGE SERIAL DO ARDUINO
echo ============================================================
echo.
echo Feche o Monitor Serial da Arduino IDE antes de continuar.
echo O app do AgroSmart deve estar rodando em:
echo   http://localhost:%PORTA_APP%
echo.
if defined ESTUFA_TOKEN (
  echo Token do .env.local carregado.
) else (
  echo Sem ESTUFA_TOKEN configurado. Se o app exigir token, defina no .env.local.
)
echo.
echo Portas seriais encontradas:
call npm run listar
echo.
set "SERIAL_PORT="
set /p "SERIAL_PORT=Digite a porta do Arduino (ex.: COM3): "
if "%SERIAL_PORT%"=="" set "SERIAL_PORT=COM3"

set "API_URL=http://localhost:%PORTA_APP%/api/estufa/leituras"

echo.
echo Conectando em %SERIAL_PORT%...
echo Enviando para %API_URL%
echo Pressione Ctrl+C para encerrar.
echo.
call npm start
echo.
echo Bridge encerrado.
pause
endlocal
