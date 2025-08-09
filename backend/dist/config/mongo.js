"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoStatus = void 0;
exports.initMongoWithRetry = initMongoWithRetry;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
exports.mongoStatus = {
    connected: false,
    lastError: undefined,
};
function attachListeners() {
    mongoose_1.default.connection.on('connected', () => {
        exports.mongoStatus.connected = true;
        exports.mongoStatus.lastError = undefined;
        console.log('[mongo] conectado');
    });
    mongoose_1.default.connection.on('disconnected', () => {
        exports.mongoStatus.connected = false;
        console.warn('[mongo] desconectado');
    });
    mongoose_1.default.connection.on('error', (error) => {
        exports.mongoStatus.connected = false;
        exports.mongoStatus.lastError = String(error?.message ?? error);
        console.error('[mongo] erro', error);
    });
}
let started = false;
function initMongoWithRetry(retryMs = 5000) {
    if (started)
        return;
    started = true;
    attachListeners();
    const mongoUri = env_1.env.mongoUri;
    const tryConnect = async () => {
        try {
            // Falhar rápido e não "bufferizar" operações quando offline
            mongoose_1.default.set('bufferCommands', false);
            await mongoose_1.default.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        }
        catch (err) {
            exports.mongoStatus.connected = false;
            exports.mongoStatus.lastError = String(err?.message ?? err);
            console.warn(`[mongo] conexão falhou, tentando novamente em ${retryMs}ms`);
            setTimeout(tryConnect, retryMs);
        }
    };
    void tryConnect();
}
//# sourceMappingURL=mongo.js.map