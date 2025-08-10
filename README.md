# Moonlight Logger

![node](https://img.shields.io/badge/node-%3E%3D18-00AEEF?logo=node.js)
![typescript](https://img.shields.io/badge/TypeScript-5.9+-blue?logo=typescript)
![react](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![tailwind](https://img.shields.io/badge/Tailwind-3.2.7-38B2AC?logo=tailwind-css)

> Um sistema inteligente de logging para aplicações Node.js, com análise automática e painel web dark mode — em tempo real via Socket.IO.

## Visão

- Clareza para debugging: registrar, entender e agir sobre logs rapidamente
- Análise automática (tags e sugestões)
- Tempo real: novos logs aparecem instantaneamente
- UI dark inspirada na vibe "Filho da Lua"

## Stack

- Backend: Node.js 18+, TypeScript, Express, MongoDB (Mongoose), Redis (BullMQ), Socket.IO
- Frontend: React + Vite + TypeScript, Tailwind CSS 3.2.7

## Requisitos

- Node.js 18+
- MongoDB em `mongodb://localhost:27017`
- Redis em `redis://localhost:6379`

Dica (Docker):

```bash
# MongoDB
docker run -d --name mongo -p 27017:27017 mongo:6
# Redis
docker run -d --name redis -p 6379:6379 redis:7
```

## Configuração

Crie `backend/.env` com:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/moonlightlogger
REDIS_URL=redis://localhost:6379
NODE_ENV=development

# Token para autenticação de ingestão (opcional)
INGEST_TOKEN=your-secure-token-here

# Provider de IA (heuristic, openai, ollama)
AI_PROVIDER=heuristic
```

## Executando

Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Acesse: `http://localhost:5173`

## Instalação com Docker (one-click)

Requer Docker + Docker Compose. Sobe MongoDB, Redis, Backend e Frontend:

```bash
docker compose up -d --build
```

- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`

## Tempo Real (Socket.IO)

- Backend emite `log-created` ao salvar um novo log.
- Frontend escuta `log-created` e atualiza a lista.

## API

### Logs Básicos
- POST `/api/logs` — cria um log e dispara `log-created`
- GET  `/api/logs` — lista logs. Filtros: `level`, `tag`, `q`, `limit`

### Ingestão de Logs (Recomendado)
- POST `/api/ingest/raw` — ingestão de logs brutos com análise automática
- GET  `/api/ingest/health` — status da ingestão

Exemplo de ingestão:
```bash
# Sem autenticação (se INGEST_TOKEN não configurado)
curl -X POST http://localhost:4000/api/ingest/raw \
  -H "Content-Type: application/json" \
  -d '{"level":"error","message":"Cannot read property map of undefined","stack":"at dashboard.tsx:42:13","source":"my-app"}'

# Com autenticação
curl -X POST http://localhost:4000/api/ingest/raw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secure-token-here" \
  -d '{"level":"error","message":"Timeout connecting to Redis","source":"api-service"}'
```

**Vantagens da ingestão:**
- Parse automático de arquivo:linha:coluna
- Análise heurística imediata (tags + sugestões)
- Processamento assíncrono para IA
- Rate-limit: 100 requests/15min por IP
- Suporte a batch (até 100 logs por request)

## Análise Inteligente

- **Heurística**: análise baseada em padrões de texto
- **Tags automáticas**: categorização por tipo de erro
- **Sugestões**: dicas para resolver problemas comuns
- **IA**: classificação e explicação avançada (em desenvolvimento)

## Roadmap

- [x] Filtros básicos (nível, tag, busca, limite)
- [x] Gráficos estatísticos (volume por nível/tempo)
- [x] Ingestão de logs com análise automática
- [ ] Preferências do usuário (tema/filtros)
- [ ] ML com TensorFlow.js (padrões avançados)

## Screenshots

Coloque seus screenshots ou GIFs em `assets/screenshots/` e referencie aqui:

![Overview Dark](assets/screenshots/overview.png)
![Realtime Logs](assets/screenshots/realtime.gif)

## Licença

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

MIT
