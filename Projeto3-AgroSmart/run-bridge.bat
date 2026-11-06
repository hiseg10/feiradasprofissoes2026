@echo off
chcp 65001 >nul
setlocal EnableExtensions
call "%~dp0firmware\bridge-serial\run-bridge.bat" %1
endlocal
