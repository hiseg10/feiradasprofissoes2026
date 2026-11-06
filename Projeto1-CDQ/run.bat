@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
set "PORTA=%~1"
if "%PORTA%"=="" set "PORTA=3000"
title CDQ - Classificados do Deus Quer

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
echo Observacao: para o login com Google, preencha GOOGLE_CLIENT_ID e
echo GOOGLE_CLIENT_SECRET no arquivo .env.local.
echo Redirect URI esperado:
echo   http://localhost:%PORTA%/api/auth/google/callback
echo.
echo Iniciando o CDQ em http://localhost:%PORTA%
echo Pressione Ctrl+C para encerrar.
echo.
call npm run dev -- -p %PORTA% -H 0.0.0.0
echo.
echo O servidor foi encerrado.
pause
endlocal
