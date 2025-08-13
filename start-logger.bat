@echo off
title Moonlight Logger - Iniciando...
color 0B

echo.
echo ========================================
echo    🌙 MOONLIGHT LOGGER
echo ========================================
echo.
echo 🚀 Iniciando o sistema...
echo.

REM Verifica se as pastas existem
if not exist "backend" (
    echo ❌ Pasta 'backend' não encontrada!
    echo 💡 Execute primeiro: install.bat
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ Pasta 'frontend' não encontrada!
    echo 💡 Execute primeiro: install.bat
    pause
    exit /b 1
)

echo ✅ Estrutura verificada!
echo.

REM Inicia o frontend em uma nova janela
echo 🎨 Iniciando frontend...
start "Moonlight Logger - Frontend" cmd /k "cd frontend && npm run dev"

REM Aguarda um pouco para o frontend inicializar
echo ⏳ Aguardando frontend inicializar...
timeout /t 5 /nobreak >nul

REM Inicia o backend em uma nova janela
echo 🔧 Iniciando backend...
start "Moonlight Logger - Backend" cmd /k "cd backend && npm start"

echo.
echo ========================================
echo    🌙 MOONLIGHT LOGGER INICIADO!
echo ========================================
echo.
echo 🎯 Frontend: http://localhost:3000
echo 🎯 Backend: http://localhost:3001
echo.
echo 💡 Para parar: Feche as janelas do CMD
echo 📚 Documentação: README.md
echo.
echo 🌙 Comece a usar em seus projetos!
echo.
pause
