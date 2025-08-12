"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const logs_1 = __importDefault(require("./routes/logs"));
const stats_1 = require("./routes/stats");
const ingest_1 = require("./routes/ingest");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json({ limit: '1mb' }));
    app.get('/health', (_req, res) => res.json({ ok: true }));
    app.use('/api/logs', logs_1.default);
    app.use('/api/stats', stats_1.statsRouter);
    app.use('/api/ingest', ingest_1.ingestRouter);
    return app;
}
//# sourceMappingURL=app.js.map