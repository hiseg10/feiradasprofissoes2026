@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
title Feira Hub - Bootloader e QR Codes

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
  echo Instalando dependencias do hub...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo [ERRO] Falha ao instalar as dependencias.
    pause
    exit /b 1
  )
)

if "%HUB_PORT%"=="" set "HUB_PORT=4000"

echo.
echo Feira Hub em http://localhost:%HUB_PORT%
echo Na rede, abra o IP mostrado na pagina.
echo Os controles de iniciar/parar so funcionam neste notebook.
echo.
start "" cmd /c "timeout /t 2 >nul & start http://localhost:%HUB_PORT%"

if /i "%~1"=="--autostart" (
  call npm start -- --autostart
) else (
  call npm start
)

echo.
echo Hub encerrado.
pause
endlocal
