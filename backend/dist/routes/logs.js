"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logsRouter = void 0;
const express_1 = require("express");
const Log_1 = require("../models/Log");
const logAnalysisService_1 = require("../services/logAnalysisService");
exports.logsRouter = (0, express_1.Router)();
exports.logsRouter.post('/', async (req, res) => {
    const { level = 'info', message, context } = req.body ?? {};
    if (!message)
        return res.status(400).json({ error: 'message é obrigatório' });
    const normalizedLevel = String(level).toLowerCase();
    const validLevels = ['info', 'warn', 'error', 'debug'];
    if (!validLevels.includes(normalizedLevel)) {
        return res.status(400).json({ error: 'level inválido' });
    }
    const analysis = (0, logAnalysisService_1.analyzeLog)(String(message));
    const created = await Log_1.LogModel.create({
        level: normalizedLevel,
        message,
        context,
        tags: analysis.tags,
        suggestion: analysis.suggestion,
    });
    try {
        const io = req.app.get('io');
        io?.emit('log-created', created);
    }
    catch { }
    res.status(201).json(created);
});
exports.logsRouter.get('/', async (req, res) => {
    const { level, tag, q, limit = '50', page = '1', from, to, paginate } = req.query;
    const query = {};
    if (level)
        query.level = level;
    if (tag)
        query.tags = tag;
    if (q)
        query.message = { $regex: q, $options: 'i' };
    if (from || to) {
        query.timestamp = {};
        if (from)
            query.timestamp.$gte = new Date(from);
        if (to)
            query.timestamp.$lte = new Date(to);
    }
    const limitNumber = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const pageNumber = Math.max(Number(page) || 1, 1);
    const skip = (pageNumber - 1) * limitNumber;
    const [items, total] = await Promise.all([
        Log_1.LogModel.find(query).sort({ timestamp: -1 }).skip(skip).limit(limitNumber),
        Log_1.LogModel.countDocuments(query),
    ]);
    if (String(paginate).toLowerCase() === 'true') {
        const pages = Math.max(Math.ceil(total / limitNumber), 1);
        return res.json({ items, pageInfo: { total, page: pageNumber, pages, limit: limitNumber } });
    }
    res.json(items);
});
//# sourceMappingURL=logs.js.map