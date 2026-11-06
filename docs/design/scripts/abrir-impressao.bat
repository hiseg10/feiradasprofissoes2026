@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
title Impressao - Feira Florestan 2026

echo Abrindo as paginas de impressao...
echo.
echo 1. Cartolinas A4 (4 por folha)
echo 2. Moldes de letras (uma letra por A4)
echo.

start "" "%~dp0..\cartolinas\imprimir-cartolinas.html"
start "" "%~dp0imprimir-letras.html"

echo Se as paginas nao abrirem, abra manualmente:
echo   docs\design\cartolinas\imprimir-cartolinas.html
echo   docs\design\scripts\imprimir-letras.html
echo.
timeout /t 4 >nul
endlocal
