import type { Server } from 'socket.io';
import { LogModel } from '../models/Log';
import { parseLogMessage } from '../logger/parser';

type LogLevel = 'info' | 'warn' | 'error';

function formatArgs(args: unknown[]): string {
  return args
    .map((arg) => {
      if (typeof arg === 'string') return arg;
      if (arg instanceof Error) return arg.stack ?? `${arg.name}: ${arg.message}`;
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    })
    .join(' ');
}

async function persistAndEmit(
  io: Server,
  level: LogLevel,
  message: string,
  context: Record<string, unknown>
): Promise<void> {
  try {
    const parsed = parseLogMessage(message);
    const created = await LogModel.create({
      level,
      message: parsed.message,
      context: { ...context, file: parsed.file, line: parsed.line, column: parsed.column },
    });
    io.emit('log-created', created);
  } catch {
    // Evita loops/erros caso Mongo caia; não faz console.* aqui para não recursar
  }
}

export function installConsoleCapture(io: Server): void {
  if ((global as any).__moon_console_capture_installed) return;
  (global as any).__moon_console_capture_installed = true;

  const original = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  } as const;

  console.log = (...args: unknown[]) => {
    const message = formatArgs(args);
    void persistAndEmit(io, 'info', message, {
      origin: 'console.log',
      pid: process.pid,
    });
    original.log(...(args as any));
  };

  console.warn = (...args: unknown[]) => {
    const message = formatArgs(args);
    void persistAndEmit(io, 'warn', message, {
      origin: 'console.warn',
      pid: process.pid,
    });
    original.warn(...(args as any));
  };

  console.error = (...args: unknown[]) => {
    const message = formatArgs(args);
    void persistAndEmit(io, 'error', message, {
      origin: 'console.error',
      pid: process.pid,
    });
    original.error(...(args as any));
  };

  process.on('uncaughtException', (err) => {
    const message = err?.stack ?? err?.message ?? String(err);
    void persistAndEmit(io, 'error', message, {
      origin: 'uncaughtException',
      pid: process.pid,
    });
    original.error('[uncaughtException]', err);
  });

  process.on('unhandledRejection', (reason: unknown) => {
    const message =
      reason instanceof Error
        ? reason.stack ?? reason.message
        : formatArgs([reason]);
    void persistAndEmit(io, 'error', message, {
      origin: 'unhandledRejection',
      pid: process.pid,
    });
    original.error('[unhandledRejection]', reason as any);
  });
}


