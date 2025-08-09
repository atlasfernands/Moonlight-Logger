export type ParsedLog = {
  message: string;
  file?: string;
  line?: number;
  column?: number;
};

// Tenta extrair arquivo:linha:col de mensagens/stack do Node
// Exemplos que cobre:
//  - at Object.<anonymous> (src/index.ts:12:34)
//  - at src/index.ts:12:34
//  - /usr/app/src/index.ts:12:34
//  - Error: Boom\n    at /app/file.js:10:5
const STACK_FILE_RE = /(at\s+[^()]*\(|\b)(?<file>([A-Za-z]:)?[^\s:()]+\.(?:js|ts|tsx|mjs|cjs)):(?<line>\d+)(?::(?<column>\d+))?\)?/m;

export function parseLogMessage(raw: string): ParsedLog {
  const match = STACK_FILE_RE.exec(raw);
  if (!match || !match.groups) return { message: raw };
  const { file, line, column } = match.groups as Record<string, string | undefined>;
  const result: ParsedLog = { message: raw };
  if (file) result.file = file;
  if (line) result.line = Number(line);
  if (column) result.column = Number(column);
  return result;
}


