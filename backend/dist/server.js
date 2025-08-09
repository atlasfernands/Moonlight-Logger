"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = require("./app");
const env_1 = require("./config/env");
const mongo_1 = require("./config/mongo");
async function bootstrap() {
    await (0, mongo_1.connectToMongo)();
    const app = (0, app_1.createApp)();
    const server = http_1.default.createServer(app);
    const io = new socket_io_1.Server(server, { cors: { origin: '*' } });
    // disponibiliza o io para rotas e middlewares
    app.set('io', io);
    io.on('connection', (socket) => {
        console.log('[socket] client conectado', socket.id);
    });
    server.listen(env_1.env.port, () => {
        console.log(`Servidor rodando em http://localhost:${env_1.env.port}`);
    });
}
bootstrap().catch((err) => {
    console.error('Falha ao iniciar servidor', err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map