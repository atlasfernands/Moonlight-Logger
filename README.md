# Moonlight Logger

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

- Filtros avançados + paginação
- Gráficos de volume por nível/tempo (Recharts/Chart.js)
- Preferências do usuário no painel
- ML opcional (TensorFlow.js)

## Licença

MIT
