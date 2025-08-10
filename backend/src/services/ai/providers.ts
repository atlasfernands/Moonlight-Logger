import type { LogDocument } from '../../models/Log';

export interface AiResult {
  classification?: string;
  explanation?: string;
  suggestion?: string;
  provider?: string;
  score?: number;
}

export interface AiProvider { analyze(input: LogDocument): Promise<AiResult>; }

export const heuristicProvider: AiProvider = {
  async analyze(input) {
    const msg = `${input.message}`.toLowerCase();
    const result: AiResult = { provider: 'heuristic' };
    if (msg.includes('cannot read') || msg.includes('undefined')) {
      result.classification = 'NullReferenceError';
      result.explanation = "A variável está undefined antes do uso.";
      result.suggestion = "Cheque inicialização/optional chaining (?.).";
      result.score = 0.6;
    }
    if (!result.classification && msg.includes('timeout')) {
      result.classification = 'TimeoutError';
      result.explanation = 'Operação excedeu o tempo limite.';
      result.suggestion = 'Aumente timeouts e monitore latência.';
      result.score = 0.5;
    }
    return result;
  },
};

export function selectProvider(name?: string): AiProvider {
  // Por agora, apenas heurístico (OpenAI/Ollama podem ser adicionados aqui)
  return heuristicProvider;
}


