import { LogModel, LogDocument } from '../models/Log';
import { parseLogMessage } from '../logger/parser';
import { LogAnalysisService } from './logAnalysisService';
import { Server as SocketIOServer } from 'socket.io';
import { Types } from 'mongoose';

let io: SocketIOServer;
let analysisService: LogAnalysisService;

export function installConsoleCapture(socketIO: SocketIOServer) {
  io = socketIO;
  analysisService = new LogAnalysisService();
  
  console.log('🔍 Console capture instalado com análise híbrida');
  
  // Intercepta console.log
  const originalLog = console.log;
  console.log = function(...args: any[]) {
    originalLog.apply(console, args);
    captureLog('info', args);
  };

  // Intercepta console.warn
  const originalWarn = console.warn;
  console.warn = function(...args: any[]) {
    originalWarn.apply(console, args);
    captureLog('warn', args);
  };

  // Intercepta console.error
  const originalError = console.error;
  console.error = function(...args: any[]) {
    originalError.apply(console, args);
    captureLog('error', args);
  };

  // Intercepta console.debug
  const originalDebug = console.debug;
  console.debug = function(...args: any[]) {
    originalDebug.apply(console, args);
    captureLog('debug', args);
  };

  // Captura erros não tratados
  process.on('uncaughtException', (error: Error) => {
    captureUnhandledError('uncaughtException', error);
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    captureUnhandledError('unhandledRejection', reason);
  });
}

async function captureLog(level: 'info' | 'warn' | 'error' | 'debug', args: any[]) {
  try {
    const message = normalizeLogMessage(args);
    const parsed = parseLogMessage(message);
    
    const logData = {
      level,
      message,
      timestamp: new Date(),
      tags: [],
      context: {
        origin: 'console',
        pid: process.pid,
        ...(parsed.file && { file: parsed.file }),
        ...(parsed.line && { line: parsed.line }),
        ...(parsed.column && { column: parsed.column })
      }
    };

    const log = new LogModel(logData);
    await log.save();
    const savedLog = log as LogDocument;

    // Análise automática em background
    try {
      await analyzeLogInBackground(
        typeof savedLog._id === 'object' && savedLog._id !== null && 'toString' in savedLog._id
          ? savedLog._id.toString()
          : String(savedLog._id),
        message,
        logData.context
      );
    } catch (err) {
      console.error('Erro ao analisar log em background:', err);
    }

    // Emite para frontend em tempo real
    if (io) {
      const logId =
        typeof savedLog._id === 'object' && savedLog._id !== null && 'toString' in savedLog._id
          ? savedLog._id.toString()
          : String(savedLog._id);

      io.emit('log-created', {
        _id: logId,
        ...logData,
        ai: { classification: 'Analyzing...', explanation: '', suggestion: '' }
      });
    }

  } catch (error) {
    console.error('Erro ao capturar log:', error);
  }
}

async function captureUnhandledError(type: string, error: Error | any) {
  try {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : '';
    
    const logData = {
      level: 'error' as const,
      message: `${type}: ${message}`,
      timestamp: new Date(),
      tags: ['unhandled', type],
      context: {
        origin: type,
        pid: process.pid,
        stack
      }
    };

    const log = new LogModel(logData);
    await log.save();
    const savedLog = log as LogDocument;
    const logId = (savedLog._id as Types.ObjectId).toString();

    // Análise automática em background
    analyzeLogInBackground(logId, message, logData.context);

    // Emite para frontend em tempo real
    if (io) {
      io.emit('log-created', {
        _id: logId,
        ...logData,
        ai: { classification: 'Analyzing...', explanation: '', suggestion: '' }
      });
    }

  } catch (captureError) {
    console.error('Erro ao capturar erro não tratado:', captureError);
  }
}

async function analyzeLogInBackground(logId: string, message: string, context: any) {
  try {
    // Análise em background para não bloquear o fluxo principal
    setImmediate(async () => {
      try {
        const analysis = await analysisService.analyzeLog(logId, message, context);
        
        // Atualiza o log com a análise
        await LogModel.findByIdAndUpdate(logId, {
          'ai.classification': analysis.classification,
          'ai.explanation': analysis.explanation,
          'ai.suggestion': analysis.suggestion,
          'ai.provider': analysis.source,
          tags: analysis.tags
        });

        // Emite atualização para o frontend
        if (io) {
          io.emit('log-analyzed', {
            logId,
            analysis: {
              classification: analysis.classification,
              explanation: analysis.explanation,
              suggestion: analysis.suggestion,
              provider: analysis.source,
              confidence: analysis.confidence,
              tags: analysis.tags
            }
          });
        }

      } catch (analysisError) {
        console.error('Erro na análise automática:', analysisError);
      }
    });

  } catch (error) {
    console.error('Erro ao agendar análise:', error);
  }
}

function normalizeLogMessage(args: any[]): string {
  return args.map(arg => {
    if (typeof arg === 'string') return arg;
    if (arg instanceof Error) return arg.stack || arg.message;
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  }).join(' ');
}

export function getAnalysisService(): LogAnalysisService {
  return analysisService;
}


