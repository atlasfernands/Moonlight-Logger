import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { initMongoWithRetry } from './config/mongo';
import { redisConnection } from './config/redis';
import { finalConfig } from './config/app';
import logsRouter from './routes/logs';
import { statsRouter } from './routes/stats';
import { installConsoleCapture } from './services/consoleCapture';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || `http://localhost:${finalConfig.frontendPort}`,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Conecta com MongoDB e Redis
initMongoWithRetry();
// Redis já está conectado via import

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
    config: {
      port: finalConfig.port,
      frontendPort: finalConfig.frontendPort,
      features: finalConfig.features,
      scaling: finalConfig.scaling
    },
    services: {
      mongo: 'connected', // Simplificado - em produção verificar status real
      redis: finalConfig.scaling.redisEnabled ? 'enabled' : 'disabled',
      analysis: finalConfig.features.aiAnalysis ? 'ai-enabled' : 'heuristics-only',
      offlineMode: finalConfig.features.offlineMode
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

server.listen(finalConfig.port, () => {
  console.log('=' .repeat(60));
  console.log('🌙 MOONLIGHT LOGGER INICIADO COM SUCESSO!');
  console.log('=' .repeat(60));
  console.log(`🚀 Backend: http://localhost:${finalConfig.port}`);
  console.log(`🎨 Frontend: http://localhost:${finalConfig.frontendPort}`);
  console.log(`🔌 Socket.IO: ws://localhost:${finalConfig.port}`);
  console.log('');
  console.log('⚙️  Configurações ativas:');
  console.log(`   📊 Porta: ${finalConfig.port}`);
  console.log(`   🎨 Frontend: ${finalConfig.frontendPort}`);
  console.log(`   📝 Nível de log: ${finalConfig.logLevel}`);
  console.log(`   🔄 Tempo real: ${finalConfig.enableRealTime ? '✅' : '❌'}`);
  console.log(`   �� IA: ${finalConfig.features.aiAnalysis ? '✅' : '❌'}`);
  console.log(`   🔌 Offline: ${finalConfig.features.offlineMode ? '✅' : '❌'}`);
  console.log(`   🚀 Redis: ${finalConfig.scaling.redisEnabled ? '✅' : '❌'}`);
  console.log(`   📈 Auto-scaling: ${finalConfig.scaling.autoScale ? '✅' : '❌'}`);
  console.log('');
  console.log('🎯 Para testar:');
  console.log(`   1. Acesse: http://localhost:${finalConfig.frontendPort}`);
  console.log(`   2. Execute: simulate-errors.bat`);
  console.log(`   3. Veja os logs em tempo real!`);
  console.log('');
  console.log('🌙 Moonlight Logger está pronto para facilitar sua vida!');
  console.log('=' .repeat(60));
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

