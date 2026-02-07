#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

pass_count=0

print_header() {
  local n="$1"
  local title="$2"
  echo
  echo "============================================================"
  echo "Teste ${n}/5 - ${title}"
  echo "============================================================"
}

register_pass() {
  local msg="$1"
  pass_count=$((pass_count + 1))
  echo "✅ ${msg}"
}

print_improvement_sequence() {
  local seq="$1"
  local org="$2"
  echo "🔧 Sequência de melhoria: ${seq}"
  echo "🗂️ Organização sugerida: ${org}"
}

# Teste 1
print_header 1 "Estrutura base do projeto"
required_paths=(
  "backend/package.json"
  "frontend/package.json"
  "backend/src"
  "frontend/src"
  "README.md"
)
for path in "${required_paths[@]}"; do
  [[ -e "$path" ]] || { echo "❌ Caminho obrigatório ausente: $path"; exit 1; }
  echo "- Encontrado: $path"
done
register_pass "Estrutura base validada"
print_improvement_sequence \
  "1) consolidar pastas de documentação em /docs; 2) padronizar scripts de inicialização em /scripts; 3) adicionar checklist de release." \
  "Separar claramente código de aplicação (backend/frontend), automações (scripts) e documentação (docs/reports)."

# Teste 2
print_header 2 "Scripts essenciais do backend"
required_scripts=("build" "dev" "test" "lint" "type-check")
for script in "${required_scripts[@]}"; do
  if node -e "const p=require('./backend/package.json'); if(!p.scripts || !p.scripts['$script']) process.exit(1);"; then
    echo "- Script presente: $script"
  else
    echo "❌ Script ausente no backend/package.json: $script"
    exit 1
  fi
done
register_pass "Scripts essenciais do backend validados"
print_improvement_sequence \
  "1) incluir script 'ci' agregando lint+type-check+test; 2) separar testes rápidos e longos; 3) aplicar convenção de nomenclatura em scripts." \
  "Agrupar scripts por categoria (build, quality, test, ops) para facilitar manutenção."

# Teste 3
print_header 3 "Arquivos de configuração e exemplos"
config_files=(
  "backend/env.example"
  "backend/config.json.example"
  "docker-compose.yml"
  "frontend/vite.config.ts"
)
for file in "${config_files[@]}"; do
  [[ -f "$file" ]] || { echo "❌ Arquivo de configuração ausente: $file"; exit 1; }
  echo "- Arquivo OK: $file"
done
register_pass "Configurações e exemplos validados"
print_improvement_sequence \
  "1) versionar matriz de ambientes (dev/stage/prod); 2) validar variáveis com schema central; 3) automatizar checagem em pre-start." \
  "Manter arquivos de exemplo próximos ao serviço correspondente e documentar obrigatoriedade no README."

# Teste 4
print_header 4 "Sanidade sintática dos scripts JavaScript"
js_files=(
  "backend/alerts.js"
  "backend/log-clustering.js"
  "backend/sentiment-analysis.js"
  "backend/trend-analysis.js"
  "demo-advanced-features.js"
)
for js in "${js_files[@]}"; do
  node --check "$js"
  echo "- Sintaxe válida: $js"
done
register_pass "Sanidade sintática JavaScript validada"
print_improvement_sequence \
  "1) migrar scripts legados para TypeScript; 2) habilitar eslint também para arquivos JS; 3) adicionar validação sintática no pipeline." \
  "Separar scripts de demo, teste e produção em subpastas com responsabilidade única."

# Teste 5
print_header 5 "Integridade de módulos críticos TypeScript"
ts_files=(
  "backend/src/app.ts"
  "backend/src/server.ts"
  "backend/src/routes/logs.ts"
  "backend/src/routes/stats.ts"
  "backend/src/routes/ingest.ts"
)
for ts in "${ts_files[@]}"; do
  [[ -f "$ts" ]] || { echo "❌ Arquivo TypeScript ausente: $ts"; exit 1; }
  echo "- Módulo crítico presente: $ts"
done

# checks de conteúdo mínimo
rg -q "createApp|express" backend/src/app.ts || { echo "❌ app.ts sem assinatura esperada"; exit 1; }
rg -q "listen|PORT|process\.env" backend/src/server.ts || { echo "❌ server.ts sem bootstrap esperado"; exit 1; }
register_pass "Módulos críticos e assinaturas mínimas validados"
print_improvement_sequence \
  "1) criar testes unitários para cada rota; 2) padronizar contratos de resposta HTTP; 3) mapear cobertura de erro por endpoint." \
  "Documentar responsabilidades por módulo (bootstrap, roteamento, serviços) e manter fronteiras claras."

echo
 echo "============================================================"
 echo "Resultado final: ${pass_count}/5 testes aprovados"
 echo "============================================================"
