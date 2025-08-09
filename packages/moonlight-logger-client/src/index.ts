export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface MoonlightClientOptions {
  url?: string; // ex.: http://localhost:4000
  appName?: string; // ex.: my-app
  captureConsole?: boolean;
  captureUnhandled?: boolean;
}

async function post(url: string, payload: unknown): Promise<void> {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // silencioso
  }
}

export class MoonlightLoggerClient {
  private readonly url: string;
  private readonly appName?: string;

  constructor(private readonly options: MoonlightClientOptions = {}) {
    this.url = options.url ?? process.env.MOONLIGHT_URL ?? 'http://localhost:4000';
    this.appName = options.appName ?? process.env.APP_NAME;

    if (options.captureUnhandled) {
      process.on('uncaughtException', (err) => {
        void this.error('uncaughtException', { error: String(err?.stack ?? err) });
      });
      process.on('unhandledRejection', (reason) => {
        void this.error('unhandledRejection', { error: String(reason) });
      });
    }

    if (options.captureConsole) {
      const origLog = console.log;
      console.log = (...args: any[]) => {
        origLog(...args);
        void this.info(args.map(String).join(' '));
      };
      const origError = console.error;
      console.error = (...args: any[]) => {
        origError(...args);
        void this.error(args.map(String).join(' '));
      };
      const origWarn = console.warn;
      console.warn = (...args: any[]) => {
        origWarn(...args);
        void this.warn(args.map(String).join(' '));
      };
      const origDebug = console.debug;
      console.debug = (...args: any[]) => {
        origDebug(...args);
        void this.debug(args.map(String).join(' '));
      };
    }
  }

  private endpoint(): string {
    return `${this.url.replace(/\/$/, '')}/api/logs`;
  }

  async log(level: LogLevel, message: string, context?: Record<string, unknown>): Promise<void> {
    await post(this.endpoint(), {
      level,
      message,
      context: { ...(context ?? {}), source: this.appName },
    });
  }

  info(message: string, context?: Record<string, unknown>): Promise<void> { return this.log('info', message, context); }
  warn(message: string, context?: Record<string, unknown>): Promise<void> { return this.log('warn', message, context); }
  error(message: string, context?: Record<string, unknown>): Promise<void> { return this.log('error', message, context); }
  debug(message: string, context?: Record<string, unknown>): Promise<void> { return this.log('debug', message, context); }
}

export function createMoonlightLogger(options?: MoonlightClientOptions): MoonlightLoggerClient {
  return new MoonlightLoggerClient(options);
}


