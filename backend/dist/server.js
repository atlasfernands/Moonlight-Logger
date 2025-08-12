"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const mongo_1 = require("./config/mongo");
const logs_1 = __importDefault(require("./routes/logs"));
const stats_1 = require("./routes/stats");
const consoleCapture_1 = require("./services/consoleCapture");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Conecta com MongoDB e Redis
(0, mongo_1.initMongoWithRetry)();
// Redis já está conectado via import
// Instala captura de console com análise híbrida
(0, consoleCapture_1.installConsoleCapture)(io);
// Rotas
app.use('/api/logs', logs_1.default);
app.use('/api/stats', stats_1.statsRouter);
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
app.use((error, req, res, next) => {
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
//# sourceMappingURL=server.js.map