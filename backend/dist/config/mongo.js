"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToMongo = connectToMongo;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
async function connectToMongo() {
    const mongoUri = env_1.env.mongoUri;
    await mongoose_1.default.connect(mongoUri);
    mongoose_1.default.connection.on('connected', () => {
        console.log('[mongo] conectado');
    });
    mongoose_1.default.connection.on('error', (error) => {
        console.error('[mongo] erro', error);
    });
}
//# sourceMappingURL=mongo.js.map