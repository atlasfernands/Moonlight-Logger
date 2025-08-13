# 🚀 **GUIA DE USO RÁPIDO - MOONLIGHT LOGGER**

## ⚡ **INSTALAÇÃO EM 3 PASSOS**

### 1️⃣ **Execute o instalador**
```bash
# Clique duas vezes no arquivo:
install.bat
```

### 2️⃣ **Inicie o sistema**
```bash
# Clique duas vezes no arquivo:
start-logger.bat
```

### 3️⃣ **Acesse o dashboard**
```
🌐 Frontend: http://localhost:3000
🔧 Backend: http://localhost:3001
```

---

## 🎯 **COMO USAR EM SEUS PROJETTOS**

### **Opção 1: Captura Automática (Recomendado)**
O Moonlight Logger captura automaticamente:
- `console.log()`, `console.warn()`, `console.error()`
- Erros não tratados (`uncaughtException`, `unhandledRejection`)
- Logs de performance e memória

### **Opção 2: Envio Manual via API**
```javascript
// Envie logs diretamente para a API
fetch('http://localhost:3001/api/logs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    level: 'error',
    message: 'Erro no meu projeto',
    tags: ['meu-projeto', 'crítico'],
    context: {
      source: 'meu-app',
      userId: 123,
      action: 'login'
    }
  })
});
```

### **Opção 3: Integração com Bibliotecas**
```javascript
// Winston
const winston = require('winston');
const logger = winston.createLogger({
  transports: [
    new winston.transports.Http({
      host: 'localhost',
      port: 3001,
      path: '/api/logs'
    })
  ]
});

// Pino
const pino = require('pino');
const logger = pino({
  transport: {
    target: 'pino-http-send',
    options: {
      destination: 'http://localhost:3001/api/logs'
    }
  }
});
```

---

## 🚨 **TESTANDO O SISTEMA**

### **Simular Erros para Teste**
```bash
# Clique duas vezes no arquivo:
simulate-errors.bat
```

**Opções disponíveis:**
- **Erro único**: Teste rápido
- **Pico de erros**: 10 erros simultâneos
- **Simulação contínua**: 1 minuto de erros

---

## 📊 **O QUE VOCÊ VERÁ NO DASHBOARD**

### **Gráficos em Tempo Real:**
- 📈 **Volume de logs** por minuto
- 🚨 **Erros críticos** destacados
- 📊 **Distribuição** por nível (info, warn, error)
- ⚡ **Performance** do sistema

### **Tabela de Logs:**
- 🔍 **Filtros** por nível, tags, origem
- 📝 **Detalhes** completos de cada log
- 🎯 **Análise inteligente** com sugestões
- 📍 **Origem** do arquivo (linha, coluna)

### **Alertas Inteligentes:**
- ⚠️ **Detecção automática** de padrões
- 🚨 **Alertas** para erros críticos
- 💡 **Sugestões** para resolução
- 📊 **Métricas** de performance

---

## ⚙️ **CONFIGURAÇÕES PERSONALIZADAS**

### **Arquivo: `config.json`**
```json
{
  "port": 3001,                    // Porta do backend
  "frontendPort": 3000,            // Porta do frontend
  "logLevel": "info",              // Nível mínimo de log
  "enableRealTime": true,          // Atualizações em tempo real
  "features": {
    "errorTracking": true,         // Rastreamento de erros
    "performanceMonitoring": true, // Monitoramento de performance
    "aiAnalysis": false            // Análise com IA (opcional)
  }
}
```

---

## 🔧 **RESOLVENDO PROBLEMAS**

### **Backend não inicia:**
```bash
# Verifique se a porta 3001 está livre
netstat -an | findstr :3001

# Ou mude a porta no config.json
```

### **Frontend não carrega:**
```bash
# Verifique se a porta 3000 está livre
netstat -an | findstr :3000

# Ou mude a porta no config.json
```

### **Logs não aparecem:**
1. ✅ Verifique se o backend está rodando
2. ✅ Verifique se a API está respondendo
3. ✅ Verifique os filtros no frontend
4. ✅ Verifique o nível de log configurado

---

## 🎯 **CASOS DE USO COMUNS**

### **Desenvolvimento Local:**
- Monitore erros em tempo real
- Acompanhe performance da aplicação
- Debug de problemas rapidamente

### **Testes e QA:**
- Simule cenários de erro
- Valide comportamento do sistema
- Documente problemas encontrados

### **Produção (Opcional):**
- Configure Redis para escalabilidade
- Ative análise com IA
- Configure alertas automáticos

---

## 🌟 **RECURSOS AVANÇADOS**

### **Modo Offline:**
- Funciona sem banco de dados
- Cache local inteligente
- Escalabilidade automática

### **Análise Inteligente:**
- Detecção de padrões
- Sugestões de resolução
- Classificação automática

### **Integração com IA:**
- Análise de contexto
- Sugestões inteligentes
- Classificação avançada

---

## 📞 **SUPORTE**

### **Documentação Completa:**
- 📚 **README.md** - Documentação técnica
- 🚀 **QUICK-START.md** - Este guia
- 💡 **Exemplos** na pasta `examples/`

### **Comunidade:**
- 🐛 **Issues** no GitHub
- 💬 **Discussions** para dúvidas
- ⭐ **Star** o projeto se gostou!

---

## 🎉 **PRONTO PARA USAR!**

Agora você tem um **sistema de logging profissional** rodando localmente!

**🎯 Próximos passos:**
1. **Teste** com `simulate-errors.bat`
2. **Integre** em seus projetos
3. **Personalize** as configurações
4. **Compartilhe** com sua equipe

**🌙 O Moonlight Logger está aqui para facilitar sua vida de desenvolvedor!**
