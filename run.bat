@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
title Feira das Profissoes Florestan 2026

:menu
cls
echo ============================================================
echo   FEIRA DAS PROFISSOES FLORESTAN 2026
echo   Atalhos dos projetos
echo ============================================================
echo.
echo   1 - CDQ (Classificados do Deus Quer)      porta 3000
echo   2 - Bolsa Facil (Mercado Financeiro)      porta 3101
echo   3 - AgroSmart (Horta Inteligente)         porta 3102
echo   4 - Florestan Conecta (Turismo)           porta 3103
echo   5 - Story Games (Loja de Jogos)           porta 3104
echo   6 - Bridge serial do AgroSmart (Arduino)
echo   7 - Feira Hub (QR codes / bootloader)     porta 4000
echo   8 - Sabor do Florestan (Cantina)          porta 3105
echo   0 - Sair
echo.
set "opcao="
set /p "opcao=Escolha uma opcao: "
set "opcao=%opcao: =%"

if "%opcao%"=="1" goto abrir_cdq
if "%opcao%"=="2" goto abrir_bolsa
if "%opcao%"=="3" goto abrir_agro
if "%opcao%"=="4" goto abrir_florestan
if "%opcao%"=="5" goto abrir_story
if "%opcao%"=="6" goto abrir_bridge
if "%opcao%"=="7" goto abrir_hub
if "%opcao%"=="8" goto abrir_sabor
if "%opcao%"=="0" goto sair

echo.
echo Opcao invalida. Tente novamente.
timeout /t 2 >nul
goto menu

:abrir_cdq
call "%~dp0Projeto1-CDQ\run.bat" 3000
goto menu

:abrir_bolsa
call "%~dp0Projeto2-BolsaFacil\run.bat" 3101
goto menu

:abrir_agro
call "%~dp0Projeto3-AgroSmart\run.bat" 3102
goto menu

:abrir_florestan
call "%~dp0Projeto4-FlorestanConecta\run.bat" 3103
goto menu

:abrir_story
call "%~dp0Projeto5-StoryGames\run.bat" 3104
goto menu

:abrir_bridge
call "%~dp0Projeto3-AgroSmart\firmware\bridge-serial\run-bridge.bat" 3102
goto menu

:abrir_hub
call "%~dp0FeiraHub\start-hub.bat"
goto menu

:abrir_sabor
call "%~dp0Projeto6-SaborDoFlorestan\run.bat" 3105
goto menu

:sair
endlocal
exit /b 0

