# 🌙 **COMO USAR O MOONLIGHT LOGGER**

## 🎯 **VISÃO GERAL**

O **Moonlight Logger** é um sistema de logging profissional que funciona **offline** e captura automaticamente todos os logs, erros e avisos dos seus projetos. Ele oferece um dashboard em tempo real para monitorar e analisar o que está acontecendo em suas aplicações.

**🚀 NOVAS FUNCIONALIDADES AVANÇADAS:**
- 🚨 **Alertas Inteligentes** - Detecta padrões e problemas automaticamente
- 🔍 **Clustering de Logs** - Agrupa logs similares para reduzir ruído
- 📈 **Análise de Tendências** - Identifica padrões temporais e sazonalidade
- 🔗 **Integração Slack/Discord** - Notificações automáticas em tempo real
- 😊 **Análise de Sentimento** - Analisa o tom emocional dos logs

---

## 🚀 **INSTALAÇÃO RÁPIDA (3 PASSOS)**

### **1️⃣ Execute o instalador**
```bash
# Clique duas vezes no arquivo:
install.bat
```
✅ **O que acontece:**
- Verifica se Node.js está instalado
- Instala todas as dependências
- Compila o projeto
- Cria arquivos de configuração

### **2️⃣ Inicie o sistema**
```bash
# Clique duas vezes no arquivo:
start-logger.bat
```
✅ **O que acontece:**
- Inicia o backend na porta 3001
- Inicia o frontend na porta 3000
- Abre duas janelas do CMD (uma para cada serviço)

### **3️⃣ Acesse o dashboard**
```
🌐 Frontend: http://localhost:3000
🔧 Backend: http://localhost:3001
```

---

## 🧪 **TESTANDO AS NOVAS FUNCIONALIDADES**

### **Teste Rápido das Funcionalidades Avançadas**
```bash
# Clique duas vezes no arquivo:
test-features.bat
```

**O que você verá:**
- 🚨 Sistema de alertas detectando padrões
- 🔍 Clustering automático de logs similares
- 📈 Análise de tendências temporais
- 🔗 Integrações com Slack/Discord
- 😊 Análise de sentimento dos logs

### **Simular Erros para Teste**
```bash
# Clique duas vezes no arquivo:
simulate-errors.bat
```

**Escolha uma opção:**
1. **Erro único** - Teste rápido
2. **Pico de erros** - 10 erros simultâneos  
3. **Simulação contínua** - 1 minuto de erros

---

## 🚨 **SISTEMA DE ALERTAS INTELIGENTES**

### **Como Funciona**
O sistema detecta automaticamente:
- **Picos de erros** (5+ erros em 1 minuto)
- **Flood de warnings** (20+ warnings em 1 minuto)
- **Erros críticos** (database, connection, memory, etc.)
- **Padrões suspeitos** (logs muito similares)

### **Configuração dos Alertas**
```json
{
  "alerts": {
    "enabled": true,
    "thresholds": {
      "errorSpike": 5,
      "warningFlood": 20,
      "criticalError": 1
    }
  }
}
```

### **Tipos de Alertas**
- 🚨 **Crítico** - Problemas que requerem ação imediata
- 🔴 **Alto** - Problemas importantes que precisam de atenção
- 🟡 **Médio** - Problemas que devem ser monitorados
- 🟢 **Baixo** - Informações úteis para acompanhamento

---

## 🔍 **CLUSTERING DE LOGS SIMILARES**

### **Como Funciona**
- **Agrupa automaticamente** logs com mensagens similares
- **Reduz ruído** na análise
- **Identifica padrões** recorrentes
- **Organiza logs** por similaridade

### **Configuração do Clustering**
```json
{
  "clustering": {
    "enabled": true,
    "similarityThreshold": 0.7,
    "maxClusterSize": 100,
    "autoCleanup": true
  }
}
```

### **Benefícios**
- 📊 **Menos ruído** na visualização
- 🔍 **Padrões mais visíveis**
- ⚡ **Análise mais rápida**
- 🎯 **Foco nos problemas reais**

---

## 📈 **ANÁLISE DE TENDÊNCIAS TEMPORAIS**

### **Funcionalidades**
- **Tendências por hora/dia/semana/mês**
- **Detecção de sazonalidade** (padrões horários)
- **Identificação de anomalias** (valores fora do padrão)
- **Previsões** baseadas em dados históricos

### **Configuração das Tendências**
```json
{
  "trends": {
    "enabled": true,
    "timeWindows": ["hour", "day", "week", "month"],
    "anomalyDetection": true,
    "forecasting": true
  }
}
```

### **Insights Fornecidos**
- 📊 **Volume de logs** ao longo do tempo
- 🕐 **Picos horários** típicos
- 📅 **Efeitos de fim de semana**
- 🚨 **Anomalias** que precisam de atenção

---

## 🔗 **INTEGRAÇÕES SLACK/DISCORD/TEAMS**

### **Plataformas Suportadas**
- **Slack** - Webhooks para canais específicos
- **Discord** - Webhooks para servidores
- **Microsoft Teams** - Message cards
- **Email** - Notificações por SMTP

### **Configuração das Integrações**
```json
{
  "integrations": {
    "slack": {
      "enabled": true,
      "webhookUrl": "https://hooks.slack.com/services/...",
      "channels": ["#alerts", "#errors"],
      "notificationLevels": ["error", "warning", "alert"]
    },
    "discord": {
      "enabled": true,
      "webhookUrl": "https://discord.com/api/webhooks/...",
      "channels": ["#alerts", "#errors"]
    }
  }
}
```

### **Tipos de Notificações**
- 🚨 **Alertas** - Problemas críticos detectados
- ❌ **Erros** - Falhas no sistema
- ⚠️ **Warnings** - Problemas que precisam de atenção
- ℹ️ **Info** - Informações importantes
- 📊 **Performance** - Métricas de sistema

---

## 😊 **ANÁLISE DE SENTIMENTO DOS LOGS**

### **Como Funciona**
- **Analisa o tom emocional** das mensagens de log
- **Detecta emoções** (raiva, medo, alegria, surpresa)
- **Classifica sentimento** (muito negativo a muito positivo)
- **Gera insights** baseados no humor do sistema

### **Configuração da Análise**
```json
{
  "sentiment": {
    "enabled": true,
    "analysisDepth": "full",
    "emotionDetection": true,
    "confidenceThreshold": 0.6
  }
}
```

### **Categorias de Sentimento**
- 😠 **Muito Negativo** - Problemas críticos
- 😞 **Negativo** - Problemas que precisam de atenção
- 😐 **Neutro** - Informações normais
- 😊 **Positivo** - Sucessos e melhorias
- 🎉 **Muito Positivo** - Excelentes resultados

---

## 🎯 **COMO FUNCIONA**

### **🔍 Captura Automática**
O Moonlight Logger intercepta automaticamente:
- `console.log()` → Logs de informação
- `console.warn()` → Avisos
- `console.error()` → Erros
- `uncaughtException` → Erros não tratados
- `unhandledRejection` → Promises rejeitadas

### **📊 Dashboard em Tempo Real**
- **Gráficos** mostrando volume de logs
- **Tabela** com todos os logs capturados
- **Filtros** por nível, tags, origem
- **Análise inteligente** com sugestões
- **Atualizações automáticas** via WebSocket

### **🚀 Modo Offline**
- Funciona **sem banco de dados**
- Cache local inteligente
- Escalabilidade automática
- Zero dependências externas

---

## 🔧 **INTEGRANDO EM SEUS PROJETTOS**

### **Opção 1: Substituir console (Mais Fácil)**
```javascript
// Copie este código no início do seu projeto
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.log = function(...args) {
  originalConsoleLog.apply(console, args);
  
  // Envia para o Moonlight Logger
  fetch('http://localhost:3001/api/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      level: 'info',
      message: args.join(' '),
      timestamp: new Date(),
      tags: ['meu-projeto'],
      context: { source: 'meu-app' }
    })
  });
};

// Faça o mesmo para console.warn e console.error
```

### **Opção 2: Função dedicada**
```javascript
async function logToMoonlight(level, message, context = {}) {
  try {
    await fetch('http://localhost:3001/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level,
        message,
        timestamp: new Date(),
        tags: context.tags || [],
        context: {
          source: context.source || 'meu-projeto',
          ...context
        }
      })
    });
  } catch (error) {
    console.error('Erro ao enviar log:', error);
  }
}

// Uso:
logToMoonlight('error', 'Erro crítico detectado', {
  source: 'auth-service',
  tags: ['auth', 'critical'],
  userId: 123
});
```

### **Opção 3: Exemplo completo**
Veja o arquivo `examples/integration-example.js` para um exemplo completo de integração.

---

## 📊 **O QUE VOCÊ VERÁ NO DASHBOARD**

### **Gráficos Principais:**
- 📈 **Volume de logs** por minuto
- 🚨 **Erros críticos** destacados
- 📊 **Distribuição** por nível
- ⚡ **Performance** do sistema

### **Novas Seções Avançadas:**
- 🚨 **Alertas Ativos** - Problemas detectados automaticamente
- 🔍 **Clusters de Logs** - Grupos de logs similares
- 📈 **Tendências Temporais** - Padrões ao longo do tempo
- 😊 **Análise de Sentimento** - Humor geral do sistema
- 🔗 **Status das Integrações** - Slack, Discord, Teams

### **Tabela de Logs:**
- 🔍 **Filtros** inteligentes
- 📝 **Detalhes** completos
- 🎯 **Análise** com sugestões
- 📍 **Origem** do arquivo
- 🚨 **Alertas** relacionados
- 🔍 **Cluster** associado
- 😊 **Sentimento** detectado

---

## ⚙️ **CONFIGURAÇÕES AVANÇADAS**

### **Arquivo: `config.json`**
```json
{
  "port": 3001,
  "frontendPort": 3000,
  "logLevel": "info",
  "enableRealTime": true,
  "features": {
    "errorTracking": true,
    "performanceMonitoring": true,
    "realTimeUpdates": true,
    "aiAnalysis": true,
    "intelligentAlerts": true,
    "logClustering": true,
    "trendAnalysis": true,
    "slackDiscordIntegration": true,
    "sentimentAnalysis": true
  },
  "alerts": {
    "enabled": true,
    "thresholds": {
      "errorSpike": 5,
      "warningFlood": 20,
      "criticalError": 1
    }
  },
  "clustering": {
    "enabled": true,
    "similarityThreshold": 0.7
  },
  "trends": {
    "enabled": true,
    "anomalyDetection": true
  },
  "integrations": {
    "slack": {
      "enabled": false,
      "webhookUrl": ""
    }
  }
}
```

### **Variáveis de Ambiente:**
```bash
PORT=3001                    # Porta do backend
FRONTEND_PORT=3000          # Porta do frontend
LOG_LEVEL=info              # Nível de log
AI_ANALYSIS=true            # Ativar IA
INTELLIGENT_ALERTS=true     # Ativar alertas inteligentes
LOG_CLUSTERING=true         # Ativar clustering
TREND_ANALYSIS=true         # Ativar análise de tendências
SENTIMENT_ANALYSIS=true     # Ativar análise de sentimento
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

### **Alertas não funcionam:**
1. ✅ Verifique se `intelligentAlerts: true` no config.json
2. ✅ Verifique os thresholds configurados
3. ✅ Verifique se há logs suficientes para análise

### **Clustering não agrupa:**
1. ✅ Verifique se `logClustering: true` no config.json
2. ✅ Ajuste o `similarityThreshold` se necessário
3. ✅ Verifique se há logs similares para agrupar

### **Integrações não enviam:**
1. ✅ Verifique se as webhooks estão configuradas
2. ✅ Verifique se as integrações estão habilitadas
3. ✅ Teste as URLs das webhooks

---

## 🎯 **CASOS DE USO AVANÇADOS**

### **Monitoramento de Produção:**
- **Alertas automáticos** para problemas críticos
- **Notificações em tempo real** via Slack/Discord
- **Análise de tendências** para planejamento de capacidade
- **Detecção de anomalias** antes que afetem usuários

### **Debug de Problemas:**
- **Clustering automático** de logs similares
- **Análise de sentimento** para identificar frustrações
- **Padrões temporais** para entender quando problemas ocorrem
- **Correlação** entre diferentes tipos de logs

### **Equipes de Desenvolvimento:**
- **Compartilhamento de alertas** em canais de equipe
- **Análise colaborativa** de problemas
- **Histórico de resolução** de incidentes
- **Métricas de qualidade** do código

---

## 🚀 **RECURSOS AVANÇADOS**

### **Modo Offline:**
- Funciona sem banco de dados
- Cache local inteligente
- Escalabilidade automática

### **Análise Inteligente:**
- Detecção de padrões
- Sugestões de resolução
- Classificação automática
- Análise de sentimento

### **Integração com IA:**
- Análise de contexto
- Sugestões inteligentes
- Classificação avançada
- Previsões baseadas em dados

---

## 📞 **SUPORTE**

### **Documentação:**
- 📚 **README.md** - Documentação técnica
- 🚀 **QUICK-START.md** - Guia rápido
- 💡 **COMO-USAR.md** - Este arquivo
- 🔧 **examples/** - Exemplos práticos

### **Comunidade:**
- 🐛 **Issues** no GitHub
- 💬 **Discussions** para dúvidas
- ⭐ **Star** o projeto se gostou!

---

## 🎉 **PRONTO PARA USAR!**

Agora você tem um **sistema de logging profissional avançado** rodando localmente!

**🎯 Próximos passos:**
1. **Teste** com `test-features.bat`
2. **Configure** suas integrações no `config.json`
3. **Integre** em seus projetos
4. **Personalize** as configurações
5. **Compartilhe** com sua equipe

**🌙 O Moonlight Logger está aqui para facilitar sua vida de desenvolvedor!**

---

## 💡 **DICAS RÁPIDAS**

- **Para testar funcionalidades:** Execute `test-features.bat`
- **Para parar:** Feche as janelas do CMD
- **Para reiniciar:** Execute `start-logger.bat` novamente
- **Para testar erros:** Use `simulate-errors.bat`
- **Para configurar:** Edite `config.json`
- **Para integrar:** Veja `examples/integration-example.js`
- **Para alertas:** Configure thresholds no `config.json`
- **Para integrações:** Configure webhooks no `config.json`

**🚀 Comece a usar agora e veja a diferença!**
