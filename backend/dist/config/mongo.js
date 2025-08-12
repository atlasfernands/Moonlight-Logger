"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoStatus = void 0;
exports.initMongoWithRetry = initMongoWithRetry;
exports.checkMongoConnection = checkMongoConnection;
exports.reconnectMongo = reconnectMongo;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
exports.mongoStatus = {
    connected: false,
    lastError: undefined,
    connectionString: env_1.env.mongoUri,
    retryCount: 0,
    maxRetries: 5
};
function attachListeners() {
    mongoose_1.default.connection.on('connected', () => {
        exports.mongoStatus.connected = true;
        exports.mongoStatus.lastError = undefined;
        exports.mongoStatus.retryCount = 0;
        console.log('✅ [mongo] Conectado com sucesso');
    });
    mongoose_1.default.connection.on('disconnected', () => {
        exports.mongoStatus.connected = false;
        console.warn('⚠️ [mongo] Desconectado');
    });
    mongoose_1.default.connection.on('error', (error) => {
        exports.mongoStatus.connected = false;
        exports.mongoStatus.lastError = String(error?.message ?? error);
        console.error('❌ [mongo] Erro de conexão:', exports.mongoStatus.lastError);
    });
    mongoose_1.default.connection.on('reconnected', () => {
        console.log('🔄 [mongo] Reconectado');
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
            // Configurações otimizadas para desenvolvimento e produção
            const options = {
                serverSelectionTimeoutMS: 5000,
                bufferCommands: false,
                maxPoolSize: env_1.env.nodeEnv === 'production' ? 10 : 1,
                minPoolSize: env_1.env.nodeEnv === 'production' ? 2 : 0,
                maxIdleTimeMS: 30000,
                connectTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                heartbeatFrequencyMS: 10000,
                retryWrites: true,
                w: 'majority',
                readPreference: 'primaryPreferred'
            };
            await mongoose_1.default.connect(mongoUri, options);
            console.log('✅ [mongo] Conectado com sucesso');
            // Configurar timeouts após conexão
            mongoose_1.default.connection.db?.admin().ping();
        }
        catch (err) {
            exports.mongoStatus.connected = false;
            exports.mongoStatus.lastError = String(err?.message ?? err);
            exports.mongoStatus.retryCount++;
            console.warn(`❌ [mongo] Conexão falhou (tentativa ${exports.mongoStatus.retryCount}/${exports.mongoStatus.maxRetries}): ${exports.mongoStatus.lastError}`);
            // Em desenvolvimento, não falha completamente após algumas tentativas
            if (env_1.env.nodeEnv === 'development' && exports.mongoStatus.retryCount >= 3) {
                console.log('🔧 [mongo] Modo desenvolvimento: continuando sem MongoDB após 3 tentativas');
                console.log('💡 Para conectar MongoDB: docker run -d -p 27017:27017 mongo:latest');
                return;
            }
            // Em produção, continua tentando
            if (exports.mongoStatus.retryCount < exports.mongoStatus.maxRetries) {
                console.log(`🔄 [mongo] Tentando novamente em ${retryMs}ms...`);
                setTimeout(tryConnect, retryMs);
            }
            else {
                console.error('💥 [mongo] Máximo de tentativas atingido. Verifique a conexão.');
                if (env_1.env.nodeEnv === 'production') {
                    process.exit(1);
                }
            }
        }
    };
    void tryConnect();
}
// Função para verificar se MongoDB está disponível
async function checkMongoConnection() {
    try {
        if (mongoose_1.default.connection.db) {
            await mongoose_1.default.connection.db.admin().ping();
            return true;
        }
        return false;
    }
    catch {
        return false;
    }
}
// Função para reconectar manualmente
async function reconnectMongo() {
    try {
        if (mongoose_1.default.connection.readyState === 1) {
            console.log('ℹ️ [mongo] Já conectado');
            return;
        }
        console.log('🔄 [mongo] Tentando reconectar...');
        await mongoose_1.default.disconnect();
        exports.mongoStatus.retryCount = 0;
        initMongoWithRetry();
    }
    catch (error) {
        console.error('❌ [mongo] Erro ao reconectar:', error);
    }
}
//# sourceMappingURL=mongo.js.map