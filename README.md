# Moonlight Logger

[![CI](https://github.com/atlasfernands/Moonlight-Logger/actions/workflows/ci.yml/badge.svg)](https://github.com/atlasfernands/Moonlight-Logger/actions/workflows/ci.yml)
![coverage](https://img.shields.io/badge/coverage-soon-lightgrey)
![dependabot](https://img.shields.io/badge/Dependabot-enabled-brightgreen?logo=dependabot)
![node](https://img.shields.io/badge/node-%3E%3D18-00AEEF?logo=node.js)

> Um sistema inteligente de logging para aplicações Node.js, com análise automática e painel web dark mode — em tempo real via Socket.IO.

## Visão

- Clareza para debugging: registrar, entender e agir sobre logs rapidamente
- Análise automática (tags e sugestões)
- Tempo real: novos logs aparecem instantaneamente
- UI dark inspirada na vibe “Filho da Lua”

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

- POST `/api/logs` — cria um log e dispara `log-created`
- GET  `/api/logs` — lista logs. Filtros: `level`, `tag`, `q`, `limit`

Exemplo:
```bash
curl -X POST http://localhost:4000/api/logs \
  -H "Content-Type: application/json" \
  -d '{"level":"error","message":"Timeout connecting to Redis"}'
```

## Roadmap

- [x] Filtros básicos (nível, tag, busca, limite)
- [ ] Gráficos estatísticos (volume por nível/tempo)
- [ ] Preferências do usuário (tema/filtros)
- [ ] ML com TensorFlow.js (padrões avançados)

## Screenshots

Coloque seus screenshots ou GIFs em `assets/screenshots/` e referencie aqui:

![Overview Dark](assets/screenshots/overview.png)
![Realtime Logs](assets/screenshots/realtime.gif)

## Licença

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

MIT
