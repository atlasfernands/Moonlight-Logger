export interface ParsedLog {
  file?: string;
  line?: number;
  column?: number;
  timestamp?: Date;
  level?: 'info' | 'warn' | 'error' | 'debug';
  tags?: string[];
  context?: Record<string, any>;
  format?: 'json' | 'text' | 'nginx' | 'node' | 'unknown';
  confidence: number; // 0-1, confiança na extração
}

export interface RawLog {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp?: Date;
  tags?: string[];
  context?: Record<string, any>;
}

export class IntelligentLogParser {
  private static readonly PATTERNS = {
    // Stack traces Node.js
    nodeStackTrace: /at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/g,
    
    // Logs estruturados JSON
    jsonLog: /^\{[\s\S]*\}$/,
    
    // Logs Nginx
    nginxLog: /^(\S+) - (\S+) \[([^\]]+)\] "([^"]*)" (\d+) (\d+) "([^"]*)" "([^"]*)"$/,
    
    // Logs com timestamp ISO
    isoTimestamp: /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?)/,
    
    // Logs com timestamp Unix
    unixTimestamp: /^(\d{10,13})/,
    
    // Logs com nível explícito
    levelPattern: /(?:^|\s)(INFO|WARN|WARNING|ERROR|ERR|DEBUG|LOG)(?:\s|$)/i,
    
    // Arquivos e linhas em mensagens
    fileLinePattern: /([^\/\\]+\.(?:js|ts|jsx|tsx|py|java|cpp|c|go|rs)):(\d+)(?::(\d+))?/g,
    
    // URLs em logs
    urlPattern: /https?:\/\/[^\s]+/g,
    
    // IPs em logs
    ipPattern: /(\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b)/g,
    
    // IDs de sessão/request
    sessionId: /(?:session|request|req|id)[-_]?id[=:]\s*([a-zA-Z0-9-_]+)/gi,
    
    // Métricas numéricas
    metrics: /(\d+(?:\.\d+)?)\s*(?:ms|s|MB|GB|KB|%|req\/s)/g
  };

  static parseLogMessage(message: string): ParsedLog {
    const result: ParsedLog = {
      confidence: 0
    };

    try {
      // Tenta detectar formato JSON
      if (this.PATTERNS.jsonLog.test(message)) {
        return this.parseJsonLog(message);
      }

      // Tenta detectar formato Nginx
      if (this.PATTERNS.nginxLog.test(message)) {
        return this.parseNginxLog(message);
      }

      // Parser heurístico para logs de texto
      return this.parseTextLog(message);

    } catch (error) {
      console.warn('Erro ao fazer parsing do log:', error);
      return {
        confidence: 0,
        format: 'unknown'
      };
    }
  }

  private static parseJsonLog(message: string): ParsedLog {
    try {
      const parsed: Record<string, any> = JSON.parse(message);
      let confidence = 0.8; // Base alta para JSON válido

      const result: ParsedLog = {
        format: 'json',
        confidence
      };

      // Extrai campos conhecidos
      if (parsed.file && typeof parsed.file === 'string') {
        result.file = parsed.file;
        confidence += 0.1;
      }
      if (parsed.line) {
        const lineNum = parseInt(String(parsed.line), 10);
        if (!Number.isNaN(lineNum)) {
          result.line = lineNum;
          confidence += 0.05;
        }
      }
      if (parsed.column) {
        const colNum = parseInt(String(parsed.column), 10);
        if (!Number.isNaN(colNum)) {
          result.column = colNum;
          confidence += 0.05;
        }
      }
      if (parsed.timestamp) {
        try {
          result.timestamp = new Date(parsed.timestamp);
          confidence += 0.1;
        } catch (error) {
          // Ignora timestamp inválido
        }
      }
      if (parsed.level && typeof parsed.level === 'string') {
        const level = parsed.level.toLowerCase();
        if (level === 'info' || level === 'warn' || level === 'error' || level === 'debug') {
          result.level = level;
          confidence += 0.1;
        }
      }
      if (parsed.tags && Array.isArray(parsed.tags)) {
        result.tags = parsed.tags.filter((tag): tag is string => typeof tag === 'string');
        confidence += 0.1;
      }

      result.confidence = Math.min(1, confidence);
      return result;

    } catch (error) {
      return {
        format: 'json',
        confidence: 0.1
      };
    }
  }

  private static parseNginxLog(message: string): ParsedLog {
    const match = message.match(this.PATTERNS.nginxLog);
    if (!match) {
      return { confidence: 0, format: 'nginx' };
    }

    const [, ip, user, timestamp, request, status, bytes, referer, userAgent] = match;
    
    if (!timestamp || !status || !bytes) {
      return { confidence: 0.5, format: 'nginx' };
    }
    
    return {
      format: 'nginx',
      confidence: 0.9,
      timestamp: new Date(timestamp),
      context: {
        ip: ip || '',
        user: user || '',
        request: request || '',
        status: parseInt(status),
        bytes: parseInt(bytes),
        referer: referer || '',
        userAgent: userAgent || ''
      }
    };
  }

  private static parseTextLog(message: string): ParsedLog {
    const result: ParsedLog = {
      format: 'text',
      confidence: 0.3 // Base baixa para texto não estruturado
    };

    let confidence = 0.3;

    // Extrai timestamp ISO
    const isoMatch = message.match(this.PATTERNS.isoTimestamp);
    if (isoMatch && isoMatch[1]) {
      result.timestamp = new Date(isoMatch[1]);
      confidence += 0.2;
    }

    // Extrai timestamp Unix
    const unixMatch = message.match(this.PATTERNS.unixTimestamp);
    if (unixMatch && unixMatch[1]) {
      const timestamp = parseInt(unixMatch[1]);
      if (timestamp > 1000000000000) { // Milissegundos
        result.timestamp = new Date(timestamp);
      } else { // Segundos
        result.timestamp = new Date(timestamp * 1000);
      }
      confidence += 0.2;
    }

    // Extrai nível do log
    const levelMatch = message.match(this.PATTERNS.levelPattern);
    if (levelMatch && levelMatch[1]) {
      const level = levelMatch[1].toLowerCase();
      if (level === 'warning') result.level = 'warn';
      else if (level === 'err') result.level = 'error';
      else if (level === 'info' || level === 'warn' || level === 'error' || level === 'debug') {
        result.level = level;
      }
      confidence += 0.15;
    }

    // Extrai arquivo e linha
    const fileMatches = Array.from(message.matchAll(this.PATTERNS.fileLinePattern));
    if (fileMatches.length > 0) {
      const match = fileMatches[0];
      if (match && match[1] && match[2]) {
        result.file = match[1];
        const lineNum = parseInt(match[2], 10);
        if (!Number.isNaN(lineNum)) result.line = lineNum;
        if (match[3]) {
          const colNum = parseInt(match[3], 10);
          if (!Number.isNaN(colNum)) result.column = colNum;
        }
        confidence += 0.2;
      }
    }

    // Extrai stack trace Node.js
    const stackMatches = Array.from(message.matchAll(this.PATTERNS.nodeStackTrace));
    if (stackMatches.length > 0) {
      const match = stackMatches[0];
      // Verifica se o match existe e se os grupos necessários estão presentes
      if (match && typeof match[2] === 'string' && typeof match[3] === 'string' && typeof match[4] === 'string') {
        result.file = match[2];
        const lineNum = parseInt(match[3], 10);
        const colNum = parseInt(match[4], 10);
        if (!Number.isNaN(lineNum)) result.line = lineNum;
        if (!Number.isNaN(colNum)) result.column = colNum;
        confidence += 0.25;
      }
    }

    // Extrai URLs
    const urls = message.match(this.PATTERNS.urlPattern);
    if (urls) {
      if (!result.context) result.context = {};
      result.context.urls = urls;
      confidence += 0.05;
    }

    // Extrai IPs
    const ips = message.match(this.PATTERNS.ipPattern);
    if (ips) {
      if (!result.context) result.context = {};
      result.context.ips = ips;
      confidence += 0.05;
    }

    // Extrai IDs de sessão
    const sessionMatches = Array.from(message.matchAll(this.PATTERNS.sessionId));
    if (sessionMatches.length > 0) {
      if (!result.context) result.context = {};
      result.context.sessionIds = sessionMatches.map(m => m[1]).filter(Boolean);
      confidence += 0.05;
    }

    // Extrai métricas
    const metrics = message.match(this.PATTERNS.metrics);
    if (metrics) {
      if (!result.context) result.context = {};
      result.context.metrics = metrics;
      confidence += 0.05;
    }

    result.confidence = Math.min(1, confidence);
    return result;
  }

  static parseRawLogToDoc(rawLog: RawLog): Record<string, any> {
    const parsed = this.parseLogMessage(rawLog.message);
    
    const logDoc: Record<string, any> = {
      level: rawLog.level,
      message: rawLog.message,
      timestamp: rawLog.timestamp || parsed.timestamp || new Date(),
      tags: rawLog.tags || parsed.tags || [],
      context: {
        origin: 'parser',
        pid: process.pid,
        format: parsed.format,
        parseConfidence: parsed.confidence,
        ...rawLog.context
      }
    };

    // Adiciona campos parseados apenas se encontrados
    if (parsed.file) logDoc.context.file = parsed.file;
    if (parsed.line) logDoc.context.line = parsed.line;
    if (parsed.column) logDoc.context.column = parsed.column;
    if (parsed.context) {
      Object.assign(logDoc.context, parsed.context);
    }

    return logDoc;
  }

  static getParseStats(): { formats: Record<string, number>; averageConfidence: number } {
    // Em produção, isso seria baseado em dados reais
    return {
      formats: {
        json: 0.4,
        text: 0.35,
        nginx: 0.15,
        node: 0.1
      },
      averageConfidence: 0.72
    };
  }
}

// Funções de compatibilidade
export function parseLogMessage(message: string): ParsedLog {
  return IntelligentLogParser.parseLogMessage(message);
}

export function parseRawLogToDoc(rawLog: RawLog): Record<string, any> {
  return IntelligentLogParser.parseRawLogToDoc(rawLog);
}


