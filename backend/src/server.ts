import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { connectMongo } from './config/mongo';
import { connectRedis } from './config/redis';
import logsRouter from './routes/logs';
import statsRouter from './routes/stats';
import { installConsoleCapture } from './services/consoleCapture';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Conecta com MongoDB e Redis
connectMongo();
connectRedis();

// Instala captura de console com análise híbrida
installConsoleCapture(io);

// Rotas
app.use('/api/logs', logsRouter);
app.use('/api/stats', statsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      mongo: 'connected', // Simplificado - em produção verificar status real
      redis: 'connected',
      analysis: 'hybrid'
    }
  });
});

// Configuração do Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);
  });

  // Eventos específicos do cliente
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`👥 Cliente ${socket.id} entrou na sala: ${room}`);
  });

  socket.on('leave-room', (room) => {
    socket.leave(room);
    console.log(`👥 Cliente ${socket.id} saiu da sala: ${room}`);
  });
});

// Middleware de erro global
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado'
  });
});

// Middleware 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Moonlight Logger rodando na porta ${PORT}`);
  console.log(`🔍 Modo de análise: híbrido (heurísticas + IA opcional)`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO: ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});

