@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
set "PORTA=%~1"
if "%PORTA%"=="" set "PORTA=3000"
title Bolsa Facil - Mercado Financeiro

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
  echo Instalando dependencias pela primeira vez...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo [ERRO] Falha ao instalar as dependencias.
    pause
    exit /b 1
  )
)

if not exist ".env.local" (
  if exist ".env.example" (
    echo Criando .env.local a partir do .env.example...
    copy /y ".env.example" ".env.local" >nul
  )
)

echo.
echo Dica: sem BRAPI_TOKEN e sem chave de IA, o app funciona em modo demonstracao.
echo.
echo Iniciando o Bolsa Facil em http://localhost:%PORTA%
echo Pressione Ctrl+C para encerrar.
echo.
call npm run dev -- -p %PORTA% -H 0.0.0.0
echo.
echo O servidor foi encerrado.
pause
endlocal
