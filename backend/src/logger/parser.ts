export interface ParsedLog {
  message: string;
  file?: string;
  line?: number;
  column?: number;
}

// Tenta extrair arquivo:linha:col de mensagens/stack do Node
// Exemplos que cobre:
//  - at Object.<anonymous> (src/index.ts:12:34)
//  - at src/index.ts:12:34
//  - /usr/app/src/index.ts:12:34
//  - Error: Boom\n    at /app/file.js:10:5
const STACK_FILE_RE = /(at\s+[^()]*\(|\b)(?<file>([A-Za-z]:)?[^\s:()]+\.(?:js|ts|tsx|mjs|cjs)):(?<line>\d+)(?::(?<column>\d+))?\)?/m;

export function parseLogMessage(raw: unknown): ParsedLog {
  const text = typeof raw === 'string' ? raw : safeStringify(raw);
  const match = STACK_FILE_RE.exec(text);
  if (!match || !match.groups) return { message: text };
  const { file, line, column } = match.groups as Record<string, string | undefined>;
  const result: ParsedLog = { message: text };
  if (file) result.file = file;
  if (line) result.line = Number(line);
  if (column) result.column = Number(column);
  return result;
}

function safeStringify(value: unknown): string {
  if (value instanceof Error) return value.stack ?? `${value.name}: ${value.message}`;
  try {
    return typeof value === 'string' ? value : JSON.stringify(value);
  } catch {
    return String(value);
  }
}


