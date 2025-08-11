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

### Arquivo `config.json`
```json
{
  "analysisMode": "hybrid",
  "aiProvider": "openai",
  "aiApiKey": "YOUR_OPENAI_API_KEY",
  "aiModel": "gpt-3.5-turbo",
  "enableRealTimeAnalysis": true,
  "analysisCacheTTL": 3600
}
```

### Variáveis de Ambiente
```bash
# Backend
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

## 🧠 Regras Heurísticas

O sistema inclui regras pré-definidas para:
- **Erros de Sistema**: Padrões de erro, exceções, falhas
- **Problemas de Banco**: Conexões, timeouts, erros de query
- **Issues de API**: Timeouts, erros HTTP, falhas de rede
- **Problemas de Memória**: Vazamentos, uso excessivo
- **Avisos e Deprecações**: Warnings, código obsoleto

## 🎯 Casos de Uso

- **Monitoramento de Produção**: Logs em tempo real com análise automática
- **Debug de Aplicações**: Captura automática de erros e warnings
- **Análise de Performance**: Identificação de gargalos e problemas
- **Auditoria**: Rastreamento completo de eventos da aplicação
- **DevOps**: Integração com pipelines CI/CD e alertas

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
