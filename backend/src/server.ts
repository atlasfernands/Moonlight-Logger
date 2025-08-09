import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app';
import { env } from './config/env';
import { initMongoWithRetry, mongoStatus } from './config/mongo';

async function bootstrap() {
  initMongoWithRetry();

  const app = createApp();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });

  // disponibiliza o io para rotas e middlewares
  (app as any).set('io', io);

  io.on('connection', (socket) => {
    console.log('[socket] client conectado', socket.id);
  });

  server.listen(env.port, () => {
    console.log(`Servidor rodando em http://localhost:${env.port}`);
  });

  // health detalhada
  app.get('/status', (_req, res) => {
    res.json({
      ok: true,
      mongo: mongoStatus,
    });
  });
}

bootstrap().catch((err) => {
  console.error('Falha ao iniciar servidor', err);
  process.exit(1);
});

