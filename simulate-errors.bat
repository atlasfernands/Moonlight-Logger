@echo off
title Simulador de Erros - Moonlight Logger
color 0C

echo.
echo ========================================
echo    🚨 SIMULADOR DE ERROS
echo    🌙 MOONLIGHT LOGGER
echo ========================================
echo.
echo 🎯 Este script simula logs de erro para testar
echo    se o frontend está capturando e exibindo
echo    os erros nos gráficos corretamente.
echo.

REM Verifica se o backend está rodando
echo 🔍 Verificando se o backend está rodando...
curl -s http://localhost:3001/api/logs >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Backend não está rodando!
    echo 💡 Execute primeiro: start-logger.bat
    echo.
    pause
    exit /b 1
)

echo ✅ Backend está rodando!
echo.

echo 🚨 Escolha o tipo de simulação:
echo.
echo 1. Pico de erros (10 erros simultâneos)
echo 2. Simulação contínua (1 minuto)
echo 3. Erro único (para teste rápido)
echo.
set /p choice="Digite sua escolha (1-3): "

if "%choice%"=="1" (
    echo.
    echo 🔥 Iniciando pico de erros...
    echo ⚠️  Enviando 10 erros simultaneamente...
    echo.
    cd backend
    node simulate-errors.js spike
    cd ..
) else if "%choice%"=="2" (
    echo.
    echo 🚨 Iniciando simulação contínua...
    echo ⏱️  Duração: 1 minuto
    echo.
    cd backend
    node simulate-errors.js continuous
    cd ..
) else if "%choice%"=="3" (
    echo.
    echo ⚡ Enviando erro único...
    echo.
    cd backend
    node simulate-errors.js single
    cd ..
) else (
    echo ❌ Opção inválida!
    pause
    exit /b 1
)

echo.
echo ========================================
echo    🎯 SIMULAÇÃO CONCLUÍDA!
echo ========================================
echo.
echo 💡 Verifique o frontend em: http://localhost:3000
echo 📊 Os erros devem aparecer nos gráficos em tempo real
echo.
pause
