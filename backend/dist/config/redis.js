"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisStatus = exports.redisConnection = void 0;
exports.recordDataVolume = recordDataVolume;
exports.createQueue = createQueue;
exports.createWorker = createWorker;
exports.getRedisStatus = getRedisStatus;
exports.reconnectRedis = reconnectRedis;
exports.forceOfflineMode = forceOfflineMode;
exports.resetRedisStatus = resetRedisStatus;
exports.setScalingThreshold = setScalingThreshold;
exports.forceScalingMode = forceScalingMode;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
// Configuração híbrida: offline-first com escalabilidade automática
let redisConnection = null;
exports.redisConnection = redisConnection;
let redisStatus = {
    connected: false,
    lastError: undefined,
    retryCount: 0,
    maxRetries: 3,
    isOfflineMode: false,
    lastRetryTime: 0,
    // Novos campos para controle inteligente
    isAutoScaled: false,
    dataVolume: 0,
    thresholdForScaling: 1000, // Escala quando passar de 1000 logs
    lastScaleCheck: 0
};
exports.redisStatus = redisStatus;
// Controle de reconexão para evitar loops infinitos
let reconnectTimeout = null;
let isReconnecting = false;
// Sistema de cache local para modo offline
const localCache = new Map();
const localQueue = new Map();
const localWorkers = new Map();
function createRedisConnection() {
    try {
        // Se já estiver em modo offline, não tenta conectar
        if (redisStatus.isOfflineMode) {
            console.log('🔧 [redis] Modo offline ativo - não tentando conectar');
            return null;
        }
        // Configurações baseadas no artigo Redis - Keys para evitar loops infinitos
        const connection = new ioredis_1.default(env_1.env.redisUrl, {
            // Desabilita COMPLETAMENTE reconexão automática
            enableOfflineQueue: false,
            lazyConnect: true,
            connectTimeout: 5000,
            commandTimeout: 5000,
            enableReadyCheck: true,
            retryDelayOnFailover: 0,
            maxRetriesPerRequest: 0,
            // Configurações específicas para produção
            ...(env_1.env.nodeEnv === 'production' && {
                maxRetriesPerRequest: 5,
                connectTimeout: 10000,
                commandTimeout: 10000,
                retryDelayOnFailover: 200
            })
        });
        connection.on('error', (error) => {
            redisStatus.connected = false;
            redisStatus.lastError = error.message;
            console.warn('⚠️ [redis] Erro de conexão:', error.message);
            // Em desenvolvimento, entra em modo offline após algumas tentativas
            if (env_1.env.nodeEnv === 'development' && redisStatus.retryCount >= redisStatus.maxRetries) {
                if (!redisStatus.isOfflineMode) {
                    redisStatus.isOfflineMode = true;
                    console.log('🔧 [redis] Modo offline ativado - parando tentativas de reconexão');
                    console.log('💡 Para conectar Redis: docker run -d -p 6379:6379 redis:alpine');
                    // Força desconexão para parar tentativas automáticas
                    try {
                        connection.disconnect();
                    }
                    catch (e) {
                        // Ignora erros de desconexão
                    }
                }
                return;
            }
            // Tenta reconectar apenas se não estiver em modo offline
            if (!redisStatus.isOfflineMode && !isReconnecting) {
                scheduleReconnect();
            }
        });
        connection.on('connect', () => {
            redisStatus.connected = true;
            redisStatus.lastError = undefined;
            redisStatus.retryCount = 0;
            redisStatus.isOfflineMode = false;
            isReconnecting = false;
            console.log('✅ [redis] Conectado com sucesso');
        });
        connection.on('ready', () => {
            console.log('🚀 [redis] Pronto para operações');
        });
        connection.on('close', () => {
            redisStatus.connected = false;
            console.warn('⚠️ [redis] Conexão fechada');
            // Não tenta reconectar automaticamente se estiver em modo offline
            if (!redisStatus.isOfflineMode && !isReconnecting) {
                scheduleReconnect();
            }
        });
        connection.on('reconnecting', () => {
            if (!isReconnecting) {
                isReconnecting = true;
                console.log('🔄 [redis] Reconectando...');
            }
        });
        return connection;
    }
    catch (error) {
        console.warn('[redis] Falha ao inicializar Redis:', error);
        if (env_1.env.nodeEnv === 'development') {
            console.log('🔧 [redis] Modo desenvolvimento: continuando sem Redis');
        }
        return null;
    }
}
// Função para agendar reconexão com controle inteligente
function scheduleReconnect() {
    if (isReconnecting || redisStatus.isOfflineMode) {
        return;
    }
    redisStatus.retryCount++;
    const now = Date.now();
    // Evita tentativas muito frequentes
    if (now - redisStatus.lastRetryTime < 2000) {
        return;
    }
    redisStatus.lastRetryTime = now;
    if (redisStatus.retryCount > redisStatus.maxRetries) {
        if (env_1.env.nodeEnv === 'development') {
            redisStatus.isOfflineMode = true;
            console.log('🔧 [redis] Modo offline ativado após máximo de tentativas');
            console.log('💡 Para conectar Redis: docker run -d -p 6379:6379 redis:alpine');
            // Força desconexão da conexão atual
            if (redisConnection) {
                try {
                    redisConnection.disconnect();
                    exports.redisConnection = redisConnection = null;
                }
                catch (e) {
                    // Ignora erros de desconexão
                }
            }
        }
        else {
            console.error('💥 [redis] Máximo de tentativas de reconexão atingido');
        }
        return;
    }
    const delay = Math.min(1000 * Math.pow(2, redisStatus.retryCount - 1), 10000); // Backoff exponencial
    console.log(`🔄 [redis] Tentativa ${redisStatus.retryCount}/${redisStatus.maxRetries} em ${delay}ms`);
    reconnectTimeout = setTimeout(() => {
        if (!redisStatus.isOfflineMode) {
            try {
                exports.redisConnection = redisConnection = createRedisConnection();
            }
            catch (error) {
                console.error('❌ [redis] Falha ao reconectar:', error);
            }
        }
    }, delay);
}
// Função para verificar se precisa escalar baseado no volume de dados
function shouldScaleUp() {
    const now = Date.now();
    // Verifica a cada 5 minutos
    if (now - redisStatus.lastScaleCheck < 300000) {
        return redisStatus.isAutoScaled;
    }
    redisStatus.lastScaleCheck = now;
    // Se o volume de dados é alto, ativa escalabilidade
    if (redisStatus.dataVolume > redisStatus.thresholdForScaling && !redisStatus.isAutoScaled) {
        console.log(`📊 [redis] Volume de dados alto (${redisStatus.dataVolume}), ativando escalabilidade`);
        redisStatus.isAutoScaled = true;
        return true;
    }
    // Se o volume baixou, desativa escalabilidade
    if (redisStatus.dataVolume < redisStatus.thresholdForScaling / 2 && redisStatus.isAutoScaled) {
        console.log(`📊 [redis] Volume de dados baixo (${redisStatus.dataVolume}), desativando escalabilidade`);
        redisStatus.isAutoScaled = false;
        return false;
    }
    return redisStatus.isAutoScaled;
}
// Função para registrar volume de dados
function recordDataVolume(volume) {
    redisStatus.dataVolume = volume;
    // Se precisa escalar e tem Redis disponível, tenta conectar
    if (shouldScaleUp() && !redisStatus.connected && !redisStatus.isOfflineMode) {
        console.log('🚀 [redis] Tentando conectar para escalabilidade automática...');
        exports.redisConnection = redisConnection = createRedisConnection();
    }
}
// Inicializa conexão apenas se não estiver em modo offline
if (!redisStatus.isOfflineMode) {
    exports.redisConnection = redisConnection = createRedisConnection();
}
// Implementação de fallback para desenvolvimento sem Redis
class HybridQueue {
    constructor(name) {
        this.jobs = [];
        this.name = name;
        this.useRedis = shouldScaleUp() && redisStatus.connected;
        if (this.useRedis) {
            console.log(`🚀 [redis] Fila ${name} usando Redis para escalabilidade`);
        }
        else {
            console.log(`🔧 [local] Fila ${name} usando armazenamento local`);
        }
    }
    async add(name, data) {
        const job = { id: Date.now(), name, data, timestamp: new Date() };
        if (this.useRedis && redisConnection) {
            try {
                // Tenta usar Redis se disponível
                const queue = new bullmq_1.Queue(this.name, {
                    connection: redisConnection,
                    defaultJobOptions: {
                        removeOnComplete: 10,
                        removeOnFail: 5,
                        attempts: 3
                    }
                });
                await queue.add(name, data);
                await queue.close();
                return job;
            }
            catch (error) {
                console.warn(`⚠️ [redis] Fallback para local: ${error?.message || 'Erro desconhecido'}`);
                this.useRedis = false;
            }
        }
        // Fallback para local
        this.jobs.push(job);
        console.log(`🔧 [local] Job adicionado à fila ${this.name}:`, name);
        return job;
    }
    async getJob(id) {
        if (this.useRedis && redisConnection) {
            try {
                const queue = new bullmq_1.Queue(this.name, {
                    connection: redisConnection
                });
                const job = await queue.getJob(id);
                await queue.close();
                return job;
            }
            catch (error) {
                console.warn(`⚠️ [redis] Fallback para local: ${error?.message || 'Erro desconhecido'}`);
                this.useRedis = false;
            }
        }
        return this.jobs.find(job => job.id === id) || null;
    }
    async getJobs() {
        if (this.useRedis && redisConnection) {
            try {
                const queue = new bullmq_1.Queue(this.name, {
                    connection: redisConnection
                });
                const jobs = await queue.getJobs();
                await queue.close();
                return jobs;
            }
            catch (error) {
                console.warn(`⚠️ [redis] Fallback para local: ${error?.message || 'Erro desconhecido'}`);
                this.useRedis = false;
            }
        }
        return this.jobs;
    }
    async clean() {
        if (this.useRedis && redisConnection) {
            try {
                const queue = new bullmq_1.Queue(this.name, {
                    connection: redisConnection
                });
                await queue.clean(0, 'active');
                await queue.clean(0, 'wait');
                await queue.clean(0, 'delayed');
                await queue.clean(0, 'failed');
                await queue.clean(0, 'completed');
                await queue.close();
                console.log(`🚀 [redis] Fila ${this.name} limpa no Redis`);
                return;
            }
            catch (error) {
                console.warn(`⚠️ [redis] Fallback para local: ${error?.message || 'Erro desconhecido'}`);
                this.useRedis = false;
            }
        }
        this.jobs = [];
        console.log(`🔧 [local] Fila ${this.name} limpa localmente`);
    }
}
class HybridWorker {
    constructor(name, processor) {
        this.name = name;
        this.processor = processor;
        this.useRedis = shouldScaleUp() && redisStatus.connected;
        if (this.useRedis) {
            console.log(`🚀 [redis] Worker ${name} usando Redis para escalabilidade`);
        }
        else {
            console.log(`🔧 [local] Worker ${name} usando processamento local`);
        }
    }
    async process() {
        if (this.useRedis && redisConnection) {
            try {
                const worker = new bullmq_1.Worker(this.name, this.processor, {
                    connection: redisConnection,
                    concurrency: 2
                });
                worker.on('completed', (job) => {
                    if (job?.id) {
                        console.log(`🚀 [redis] Job ${job.id} processado com sucesso`);
                    }
                });
                worker.on('failed', (job, err) => {
                    if (job?.id) {
                        console.error(`🚀 [redis] Job ${job.id} falhou:`, err?.message || 'Erro desconhecido');
                    }
                });
                console.log(`🚀 [redis] Worker ${this.name} processando com Redis`);
                return worker;
            }
            catch (error) {
                console.warn(`⚠️ [redis] Fallback para local: ${error?.message || 'Erro desconhecido'}`);
                this.useRedis = false;
            }
        }
        console.log(`🔧 [local] Worker ${this.name} processando localmente`);
        return null;
    }
    async close() {
        if (this.useRedis) {
            console.log(`🚀 [redis] Worker ${this.name} fechado no Redis`);
        }
        else {
            console.log(`🔧 [local] Worker ${this.name} fechado localmente`);
        }
    }
}
function createQueue(name) {
    try {
        // Se estiver em modo offline ou sem conexão, usa híbrido
        if (redisStatus.isOfflineMode || !redisConnection) {
            console.log(`🔧 [local] Criando fila ${name} em modo offline`);
            return new HybridQueue(name);
        }
        if (!redisStatus.connected) {
            console.warn(`⚠️ [local] Criando fila ${name} sem conexão Redis`);
            return new HybridQueue(name);
        }
        // Verifica se precisa escalar
        if (shouldScaleUp()) {
            console.log(`🚀 [redis] Criando fila ${name} com escalabilidade automática`);
            return new HybridQueue(name);
        }
        // Modo local para volumes baixos
        console.log(`🔧 [local] Criando fila ${name} em modo local (volume baixo)`);
        return new HybridQueue(name);
    }
    catch (error) {
        console.warn(`❌ [redis] Falha ao criar fila ${name}:`, error);
        return new HybridQueue(name);
    }
}
function createWorker(name, processor) {
    try {
        // Se estiver em modo offline ou sem conexão, usa híbrido
        if (redisStatus.isOfflineMode || !redisConnection) {
            console.log(`🔧 [local] Criando worker ${name} em modo offline`);
            return new HybridWorker(name, processor);
        }
        if (!redisStatus.connected) {
            console.warn(`⚠️ [local] Criando worker ${name} sem conexão Redis`);
            return new HybridWorker(name, processor);
        }
        // Verifica se precisa escalar
        if (shouldScaleUp()) {
            console.log(`🚀 [redis] Criando worker ${name} com escalabilidade automática`);
            return new HybridWorker(name, processor);
        }
        // Modo local para volumes baixos
        console.log(`🔧 [local] Criando worker ${name} em modo local (volume baixo)`);
        return new HybridWorker(name, processor);
    }
    catch (error) {
        console.warn(`❌ [redis] Falha ao criar worker ${name}:`, error);
        return new HybridWorker(name, processor);
    }
}
// Função para verificar status do Redis
function getRedisStatus() {
    return {
        ...redisStatus,
        readyState: redisConnection?.status || 'disconnected',
        canReconnect: !redisStatus.isOfflineMode && redisStatus.retryCount < redisStatus.maxRetries,
        scalingMode: shouldScaleUp() ? 'auto' : 'manual',
        dataVolume: redisStatus.dataVolume,
        threshold: redisStatus.thresholdForScaling
    };
}
// Função para reconectar Redis manualmente
async function reconnectRedis() {
    try {
        if (redisConnection?.status === 'ready') {
            console.log('ℹ️ [redis] Já conectado');
            return;
        }
        if (redisStatus.isOfflineMode) {
            console.log('🔧 [redis] Saindo do modo offline...');
            redisStatus.isOfflineMode = false;
            redisStatus.retryCount = 0;
        }
        // Limpa timeout de reconexão se existir
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }
        console.log('🔄 [redis] Tentando reconectar manualmente...');
        // Desconecta conexão atual se existir
        if (redisConnection) {
            try {
                await redisConnection.disconnect();
            }
            catch (e) {
                // Ignora erros de desconexão
            }
        }
        exports.redisConnection = redisConnection = createRedisConnection();
    }
    catch (error) {
        console.error('❌ [redis] Erro ao reconectar:', error);
    }
}
// Função para forçar modo offline
function forceOfflineMode() {
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
    }
    redisStatus.isOfflineMode = true;
    redisStatus.retryCount = redisStatus.maxRetries;
    isReconnecting = false;
    // Força desconexão da conexão atual
    if (redisConnection) {
        try {
            redisConnection.disconnect();
            exports.redisConnection = redisConnection = null;
        }
        catch (e) {
            // Ignora erros de desconexão
        }
    }
    console.log('🔧 [redis] Modo offline forçado');
}
// Função para resetar status e tentar reconectar
function resetRedisStatus() {
    redisStatus.retryCount = 0;
    redisStatus.isOfflineMode = false;
    redisStatus.lastError = undefined;
    isReconnecting = false;
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
    }
    console.log('🔄 [redis] Status resetado, tentando reconectar...');
    // Cria nova conexão
    exports.redisConnection = redisConnection = createRedisConnection();
}
// Função para configurar threshold de escalabilidade
function setScalingThreshold(threshold) {
    redisStatus.thresholdForScaling = threshold;
    console.log(`⚙️ [redis] Threshold de escalabilidade definido para ${threshold}`);
}
// Função para forçar modo de escalabilidade
function forceScalingMode(enable) {
    redisStatus.isAutoScaled = enable;
    console.log(`⚙️ [redis] Modo de escalabilidade ${enable ? 'ativado' : 'desativado'} manualmente`);
}
//# sourceMappingURL=redis.js.map