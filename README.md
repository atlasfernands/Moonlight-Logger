# 🌙 Moonlight Logger

Sistema inteligente de logging para aplicações Node.js com análise automática e painel web em tempo real via Socket.IO.

## ✨ Características

- **🔍 Captura Automática**: Intercepta `console.log`, `console.warn`, `console.error` e erros não tratados
- **🧠 Análise Híbrida**: Combina heurísticas offline com IA opcional (OpenAI, Anthropic, Local)
- **⚡ Tempo Real**: Atualizações instantâneas via Socket.IO
- **📊 Dashboard Avançado**: Interface moderna com gráficos, filtros e estatísticas
- **🗄️ Persistência**: MongoDB com índices otimizados para performance
- **🎨 Dark Mode**: Interface elegante com tema escuro
- **🔧 Configurável**: Modos offline, híbrido ou IA-only via arquivo de configuração

## 🚀 Otimizações de Produção

### 🔧 **Processamento em Lotes Paralelos**
- **Worker Pool**: Sistema de workers para processamento paralelo de logs
- **Priorização**: Tarefas com diferentes níveis de prioridade (low, normal, high, critical)
- **Escalabilidade**: Ajuste automático do número de workers baseado na carga
- **Resiliência**: Recriação automática de workers em caso de falha

### 💾 **Cache Redis Otimizado**
- **TTL Inteligente**: Cache com expiração baseada no tipo de dado
- **Tags para Invalidação**: Sistema de tags para invalidação seletiva de cache
- **Operações em Lote**: Suporte a operações múltiplas para melhor performance
- **Políticas de Memória**: Configuração automática de políticas de evicção

### 📊 **Métricas Prometheus em Tempo Real**
- **Métricas de Logs**: Throughput, latência, taxa de erro por nível
- **Métricas de Sistema**: Uso de memória, CPU, conexões ativas
- **Métricas de Cache**: Hit rate, miss rate, tamanho do cache
- **Métricas de Workers**: Tarefas processadas, tempo de processamento, fila

### 🚨 **Sistema de Alertas Automáticos**
- **Regras Configuráveis**: Alertas baseados em thresholds e condições
- **Múltiplos Canais**: Console, webhook, Slack, email
- **Cooldown Inteligente**: Prevenção de spam de alertas
- **Severidade**: Níveis low, medium, high, critical

## 🧭 Core Mínimo (Adoção Rápida)

Para reduzir a barreira de entrada, o Moonlight Logger pode ser usado em um **core mínimo** — apenas backend + dashboard básico — deixando métricas, cache e alertas como módulos opcionais.

### ✅ O que entra no core mínimo
- **Captura automática** de logs (`console.log`, `warn`, `error`) e erros não tratados
- **API de logs** (criar, listar, buscar)
- **Dashboard básico** em tempo real via Socket.IO
- **Pipeline offline** com heurísticas (sem dependência de IA)
- **Modo de processamento mínimo** (`features.minimalProcessing`) para reduzir parsing/análise em background

### ➕ O que fica opcional
- **Cache Redis** (performance e operações em lote)
- **Métricas Prometheus/Grafana**
- **Sistema de alertas**
- **Escalabilidade horizontal com Nginx**

### 🐳 **Infraestrutura Escalável**
- **Docker Compose**: Orquestração completa com múltiplas instâncias
- **Load Balancer**: Nginx para distribuição de carga
- **Monitoramento**: Prometheus + Grafana para observabilidade
- **Health Checks**: Verificações automáticas de saúde dos serviços

## 🚀 Modos de Análise

### 1. **Offline** (Padrão)
- Funciona sem conexão com internet
- Usa regras heurísticas pré-definidas
- Análise instantânea e confiável
- Ideal para ambientes isolados

### 2. **Híbrido** (Recomendado)
- Combina heurísticas rápidas com IA inteligente
- Fallback automático para heurísticas se IA falhar
- Melhor precisão com redundância
- Balanceia velocidade e qualidade

### 3. **IA-Only**
- Análise exclusiva por inteligência artificial
- Máxima precisão e contexto
- Requer API key válida
- Ideal para análises complexas

## 🛠️ Tecnologias

- **Backend**: Node.js, TypeScript, Express, Socket.IO
- **Banco**: MongoDB (Mongoose), Redis (BullMQ)
- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **Gráficos**: Recharts, Framer Motion
- **IA**: OpenAI GPT, Anthropic Claude, Modelos Locais
- **Performance**: Worker Threads, Cache Redis, Métricas Prometheus
- **Monitoramento**: Alertas automáticos, Health checks, Métricas em tempo real

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- MongoDB 6+
- Redis 7+
- Docker (opcional)

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/moonlight-logger.git
cd moonlight-logger
```

### 2. Instale dependências
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure o banco de dados
```bash
# MongoDB
docker run -d --name mongo -p 27017:27017 mongo:6

# Redis
docker run -d --name redis -p 6379:6379 redis:7
```

### 4. Configure a análise (opcional)
```bash
cd backend
cp config.json.example config.json
# Edite config.json com suas chaves de IA
```

## ⚙️ Configuração

### Pipeline Híbrido - Variáveis de Ambiente

O Moonlight Logger usa um **pipeline híbrido inteligente** que garante funcionalidade offline sempre, com IA opcional:

```bash
# backend/.env
AI_PROVIDER=offline          # offline, hybrid, ai-only
AI_ENABLED=false            # true/false (só usado se AI_PROVIDER != offline)
MINIMAL_PROCESSING=false    # true para menor overhead no backend

# Configurações de IA (opcionais)
OPENAI_API_KEY=your_key     # Só usado se AI_PROVIDER != offline
OPENAI_BASE_URL=https://api.openai.com/v1
```

### Modos de Operação

| Modo | Heurísticas | IA | Uso |
|------|-------------|----|-----|
| `offline` | ✅ Sempre | ❌ Nunca | Padrão, garante funcionalidade |
| `hybrid` | ✅ Sempre | ✅ Condicional | Recomendado, combina ambos |
| `ai-only` | ❌ Nunca | ✅ Sempre | Máxima precisão, requer API |

### Arquivo `config.json` (Avançado)
```json
{
  "aiProvider": "openai",
  "aiApiKey": "YOUR_OPENAI_API_KEY",
  "aiModel": "gpt-3.5-turbo",
  "enableRealTimeAnalysis": true,
  "analysisCacheTTL": 3600,
  "heuristicRules": [
    {
      "pattern": "error|exception|fail",
      "classification": "Error",
      "explanation": "Log contém indicadores de erro",
      "suggestion": "Verificar stack trace e contexto",
      "priority": 1,
      "tags": ["error", "critical"]
    }
  ]
}
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/moonlight
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:5173

# IA (opcional)
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

## 🚀 Execução

### Desenvolvimento
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Produção
```bash
# Build
cd backend && npm run build
cd frontend && npm run build

# Executar
cd backend && npm start
```

## 📊 API Endpoints

### Logs
- `POST /api/logs` - Criar log
- `GET /api/logs` - Listar logs com filtros
- `GET /api/logs/:id` - Buscar log específico
- `POST /api/logs/:id/analyze` - Reanalisar log
- `DELETE /api/logs/:id` - Deletar log

### Estatísticas
- `GET /api/stats` - Estatísticas agregadas
- `GET /api/logs/stats` - Estatísticas detalhadas

### Health Check
- `GET /health` - Status dos serviços

## 🔌 Socket.IO Events

### Recebidos do Cliente
- `join-room` - Entrar em sala específica
- `leave-room` - Sair de sala

### Emitidos para o Cliente
- `log-created` - Novo log criado
- `log-analyzed` - Log analisado
- `log-updated` - Log atualizado

## 🧠 Pipeline Híbrido de Análise

### Como Funciona

O Moonlight Logger implementa um **pipeline híbrido inteligente** que garante funcionalidade sempre:

1. **🔍 Heurísticas Sempre Ativas**: Regras pré-definidas analisam logs instantaneamente
2. **🤖 IA Condicional**: Só é acionada se configurada e disponível
3. **🔄 Fallback Inteligente**: Se IA falhar, heurísticas continuam funcionando
4. **⚡ Performance Otimizada**: Análise rápida + inteligência quando necessário

### Regras Heurísticas Pré-definidas

O sistema inclui regras para:
- **Erros de Sistema**: Padrões de erro, exceções, falhas
- **Problemas de Banco**: Conexões, timeouts, erros de query
- **Issues de API**: Timeouts, erros HTTP, falhas de rede
- **Problemas de Memória**: Vazamentos, uso excessivo
- **Avisos e Deprecações**: Warnings, código obsoleto

### Configuração Rápida

```bash
# Modo offline (padrão) - funciona imediatamente
AI_PROVIDER=offline

# Modo híbrido - heurísticas + IA quando disponível
AI_PROVIDER=hybrid
OPENAI_API_KEY=your_key

# Modo IA-only - máxima precisão
AI_PROVIDER=ai-only
OPENAI_API_KEY=your_key
```

## 🧪 Stress Testing & Robustez

### Testes de Carga Automatizados

O Moonlight Logger inclui um sistema completo de stress testing para validar a robustez e performance:

### 🚀 **Demonstração das Otimizações**

Para ver as otimizações em ação, execute o script de demonstração:

```bash
cd backend
npm run build
node demo-optimizations.js
```

**O que a demonstração mostra:**
- 🔧 **Worker Pool**: Processamento paralelo de 100 tarefas
- 💾 **Cache Performance**: 1000 operações de cache com métricas
- 📊 **Métricas Tempo Real**: Atualização de métricas Prometheus
- 🚨 **Sistema de Alertas**: Regras customizadas e notificações
- 💪 **Stress Test Otimizado**: 5000 logs com todas as otimizações

### 📈 **Resultados Esperados**
- **Throughput**: 1000+ logs/s com otimizações
- **Latência**: <50ms para processamento de logs
- **Cache Hit Rate**: >80% para operações otimizadas
- **Worker Utilization**: >90% durante picos de carga

### 📐 Benchmarks Reais (Como Medir)

Para transformar expectativas em **dados reais**, rode a suite de testes e registre os números no README ou em um relatório:

```bash
# Teste rápido (baseline)
./scripts/stress-test.sh --quick

# Teste de produção (carga mais alta)
./scripts/stress-test.sh --production

# Teste com padrões de tráfego variáveis
./scripts/stress-test.sh -t 50000 -b 500 -p wave
```

**Sugestão de métricas a registrar:**
- Logs/s (throughput médio e pico)
- Latência p50/p95/p99
- Taxa de erro por nível (info/warn/error)
- Consumo de CPU/Memória
- Diferença entre modos: `offline` vs `hybrid` vs `ai-only`

### 🧪 **Stress Testing Tradicional**

```bash
# Teste rápido (10k logs)
./scripts/stress-test.sh --quick

# Teste de produção (100k logs)
./scripts/stress-test.sh --production

# Teste de caos (50k logs malformados)
./scripts/stress-test.sh --chaos

# Suite completa de testes
./scripts/stress-test.sh --full-suite

# Teste customizado
./scripts/stress-test.sh -t 50000 -b 500 -p wave -m true
```

### Padrões de Tráfego Simulados

- **Steady**: Tráfego constante e previsível
- **Spike**: Picos de tráfego seguidos de reduções
- **Wave**: Ondas de tráfego com intensidade variável
- **Chaos**: Tráfego caótico e imprevisível

### Métricas em Tempo Real

- **Throughput**: Logs por segundo
- **Latência**: Tempo médio de processamento
- **Taxa de Erro**: Logs perdidos/falhados
- **Resiliência**: Comportamento sob carga extrema

## 🔍 Parsing Inteligente Multi-Formato

### Formatos Suportados

O parser inteligente detecta e processa automaticamente:

- **JSON**: Logs estruturados com metadados
- **Nginx**: Logs de servidor web
- **Node.js**: Stack traces e logs de aplicação
- **Texto**: Logs não estruturados com heurísticas
- **Custom**: Formatos específicos de frameworks

### Extração Automática

- **Timestamps**: ISO, Unix, formatos customizados
- **Níveis**: INFO, WARN, ERROR, DEBUG
- **Contexto**: Arquivo, linha, coluna, stack traces
- **Métricas**: IPs, URLs, IDs de sessão, valores numéricos

### Fallback Inteligente

Quando heurísticas não conseguem entender um log:
1. **Análise de Padrões**: Regex avançados para detecção
2. **Classificação por Confiança**: Score 0-1 para qualidade da extração
3. **Fallback para IA**: Envio automático para análise de IA (se configurada)

## 🐳 Infraestrutura Escalável

### Docker Compose Enterprise

```bash
# Iniciar toda a infraestrutura
docker-compose up -d

# Escalar backend horizontalmente
docker-compose up -d --scale logger-service=3

# Monitoramento completo
docker-compose up -d prometheus grafana fluentd
```

### Serviços Incluídos

- **MongoDB**: Persistência de logs com autenticação
- **Redis**: Fila em tempo real com senha
- **Backend**: Serviço escalável (2+ instâncias)
- **Frontend**: Dashboard responsivo
- **Nginx**: Load balancer e proxy reverso
- **Prometheus**: Coleta de métricas
- **Grafana**: Visualização e alertas
- **Fluentd**: Agregação de logs estruturados

### Escalabilidade Horizontal

- **Auto-scaling**: Baseado em métricas de CPU/memória
- **Load Balancing**: Distribuição inteligente de carga
- **Health Checks**: Monitoramento automático de serviços
- **Graceful Shutdown**: Parada segura sem perda de dados

## 🎯 Casos de Uso

### Por perfil e cenário

- **Produção (SRE/DevOps)**: Logs em tempo real + métricas + alertas para SLA e resposta a incidentes
- **QA/Testes**: Pipeline offline para validação rápida de regressões sem depender de IA
- **Troubleshooting**: Reanálise de logs e filtros por tags/níveis para encontrar a causa raiz
- **Auditoria**: Rastreamento completo de eventos com persistência e consulta histórica

### Conexão com o pipeline híbrido

- **Offline**: ideal para ambientes isolados e testes rápidos
- **Híbrido**: recomendado para produção com precisão maior
- **IA-only**: útil para análises complexas e contexto profundo

## 🔧 Personalização

### Adicionar Regras Heurísticas
```json
{
  "id": "custom-rule",
  "pattern": "seu-padrao-aqui",
  "level": "warn",
  "classification": "Custom Warning",
  "explanation": "Explicação personalizada",
  "suggestion": "Sugestão de ação",
  "priority": 2,
  "tags": ["custom", "warning"]
}
```

### Integração com Aplicações
```javascript
// O sistema captura automaticamente:
console.log('Informação importante');
console.warn('Aviso do sistema');
console.error('Erro crítico');

// Ou via API:
fetch('/api/logs', {
  method: 'POST',
  body: JSON.stringify({
    level: 'info',
    message: 'Log personalizado',
    tags: ['custom', 'api']
  })
});
```

## 🤖 Conexão Futura com Agente de IA Pessoal

Planejamento de evolução para usar o logger como base de correção automática de bugs, com **IA do próprio usuário**:

- Login/autenticação com conta de IA pessoal do usuário
- Sugestões de correção baseadas no histórico de logs e padrões recorrentes
- Sem dependência obrigatória de endpoints corporativos de IA
- Modo opcional e controlado por configuração

## 📈 Roadmap

- [ ] Suporte a mais provedores de IA
- [ ] Análise de sentimento dos logs
- [ ] Alertas inteligentes
- [ ] Integração com Slack/Discord
- [ ] Exportação de relatórios
- [ ] Machine Learning local
- [ ] Clustering de logs similares
- [ ] Análise de tendências temporais

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/moonlight-logger/issues)
- **Discord**: [Servidor da Comunidade](https://discord.gg/seu-servidor)
- **Email**: suporte@moonlight-logger.com

---

**Moonlight Logger** - Iluminando o caminho dos seus logs 🌙✨
