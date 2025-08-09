"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogModel = void 0;
const mongoose_1 = require("mongoose");
const LogSchema = new mongoose_1.Schema({
    level: { type: String, enum: ['info', 'warn', 'error', 'debug'], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: () => new Date(), index: true },
    context: { type: Object },
    tags: [{ type: String }],
    suggestion: { type: String },
}, { versionKey: false });
exports.LogModel = (0, mongoose_1.model)('Log', LogSchema);
//# sourceMappingURL=Log.js.map