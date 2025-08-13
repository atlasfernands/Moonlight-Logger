@echo off
title Teste das Novas Funcionalidades - Moonlight Logger
color 0A

echo.
echo ========================================
echo    🧪 TESTE DAS NOVAS FUNCIONALIDADES
echo    🌙 MOONLIGHT LOGGER
echo ========================================
echo.
echo 🎯 Este script testa todas as funcionalidades avançadas:
echo    implementadas no Moonlight Logger.
echo.

REM Verifica se Node.js está instalado
echo 🔍 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não está instalado!
    echo 💡 Instale Node.js primeiro: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado!
echo.

REM Verifica se as dependências estão instaladas
echo 🔍 Verificando dependências...
if not exist "node_modules" (
    echo ⚠️  Dependências não encontradas!
    echo 💡 Execute primeiro: install.bat
    echo.
    pause
    exit /b 1
)

echo ✅ Dependências encontradas!
echo.

REM Executa o teste das funcionalidades
echo 🚀 Executando teste das funcionalidades...
echo.

cd backend
node ../demo-advanced-features.js
cd ..

echo.
echo ========================================
echo    🎉 TESTE CONCLUÍDO!
echo ========================================
echo.
echo 💡 Se tudo funcionou, você tem:
echo    ✅ Alertas Inteligentes
echo    ✅ Clustering de Logs
echo    ✅ Análise de Tendências
echo    ✅ Integração Slack/Discord
echo    ✅ Análise de Sentimento
echo.
echo 🌐 Acesse o dashboard: http://localhost:3000
echo 🔧 Configure integrações no config.json
echo.
pause
