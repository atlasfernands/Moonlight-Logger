import _ from 'lodash';

export function analyzeLog(message: string): { tags: string[]; suggestion?: string | undefined } {
  const tags: string[] = [];
  let suggestion: string | undefined;

  const lower = message.toLowerCase();
  if (lower.includes('timeout')) {
    tags.push('network', 'timeout');
    suggestion = 'Verifique latência do serviço externo e aumente timeouts.';
  }
  if (lower.includes('mongodb') || lower.includes('mongoose')) {
    tags.push('database', 'mongodb');
  }
  if (lower.includes('redis')) {
    tags.push('cache', 'redis');
  }
  if (lower.includes('unauthorized') || lower.includes('401')) {
    tags.push('auth');
    suggestion = suggestion ?? 'Cheque tokens/headers de autenticação.';
  }
  if (_.isEmpty(tags)) tags.push('general');
  return { tags: _.uniq(tags), suggestion };
}

