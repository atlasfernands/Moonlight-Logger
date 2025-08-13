@echo off
echo.
echo ========================================
echo    MOONLIGHT LOGGER - INSTALADOR
echo ========================================
echo.
echo 🚀 Instalando Moonlight Logger...
echo.

REM Verifica se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo 💡 Por favor, instale o Node.js em: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado!
echo.

REM Verifica se o npm está instalado
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm não encontrado!
    echo 💡 Por favor, instale o npm
    echo.
    pause
    exit /b 1
)

echo ✅ npm encontrado!
echo.

REM Instala dependências do backend
echo 📦 Instalando dependências do backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências do backend!
    pause
    exit /b 1
)
echo ✅ Backend configurado!
cd ..

REM Instala dependências do frontend
echo 📦 Instalando dependências do frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências do frontend!
    pause
    exit /b 1
)
echo ✅ Frontend configurado!
cd ..

REM Compila o backend
echo 🔨 Compilando o backend...
cd backend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Erro ao compilar o backend!
    pause
    exit /b 1
)
echo ✅ Backend compilado!
cd ..

REM Cria arquivo de configuração padrão
echo ⚙️  Criando configuração padrão...
if not exist "config.json" (
    echo {> config.json
    echo   "port": 3001,>> config.json
    echo   "frontendPort": 3000,>> config.json
    echo   "logLevel": "info",>> config.json
    echo   "enableRealTime": true,>> config.json
    echo   "autoStart": true>> config.json
    echo }>> config.json
    echo ✅ Configuração criada!
) else (
    echo ✅ Configuração já existe!
)

REM Cria script de inicialização
echo 🚀 Criando script de inicialização...
echo @echo off> start-logger.bat
echo echo Iniciando Moonlight Logger...>> start-logger.bat
echo echo.>> start-logger.bat
echo echo 🎯 Backend: http://localhost:3001>> start-logger.bat
echo echo 🎯 Frontend: http://localhost:3000>> start-logger.bat
echo echo.>> start-logger.bat
echo echo Pressione Ctrl+C para parar>> start-logger.bat
echo echo.>> start-logger.bat
echo start "Moonlight Logger Frontend" cmd /k "cd frontend ^& npm run dev">> start-logger.bat
echo timeout /t 3 /nobreak ^>nul>> start-logger.bat
echo start "Moonlight Logger Backend" cmd /k "cd backend ^& npm start">> start-logger.bat
echo echo.>> start-logger.bat
echo echo 🌙 Moonlight Logger iniciado com sucesso!>> start-logger.bat
echo pause>> start-logger.bat

echo ✅ Script de inicialização criado!
echo.

echo ========================================
echo    INSTALAÇÃO CONCLUÍDA!
echo ========================================
echo.
echo 🎯 Para usar o Moonlight Logger:
echo.
echo 1. Execute: start-logger.bat
echo 2. Acesse: http://localhost:3000
echo 3. Comece a usar em seus projetos!
echo.
echo 📚 Documentação: README.md
echo 🐛 Suporte: Issues no GitHub
echo.
echo 🌙 Obrigado por escolher o Moonlight Logger!
echo.
pause
