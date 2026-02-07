#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORT_DIR="$ROOT_DIR/reports"
LOG_FILE="$REPORT_DIR/npm-repair-loop.log"
mkdir -p "$REPORT_DIR"
: > "$LOG_FILE"

SAFE_ENV=(env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy -u npm_config_http_proxy -u npm_config_https_proxy -u 'npm_config_http-proxy')

run_check() {
  local title="$1"
  shift
  echo "\n### $title" | tee -a "$LOG_FILE"
  echo "\$ $*" | tee -a "$LOG_FILE"
  if "$@" >> "$LOG_FILE" 2>&1; then
    echo "✅ PASSOU: $title" | tee -a "$LOG_FILE"
    return 0
  fi
  echo "❌ FALHOU: $title" | tee -a "$LOG_FILE"
  return 1
}

echo "# Loop de reparo NPM - $(date -Iseconds)" | tee -a "$LOG_FILE"

echo "\n## Rodada 1 - Diagnóstico de conectividade" | tee -a "$LOG_FILE"
run_check "npm view express (ambiente padrão)" npm view express version || true
run_check "npm view express (safe env sem proxy)" "${SAFE_ENV[@]}" npm view express version || true

echo "\n## Rodada 2 - Backend npm" | tee -a "$LOG_FILE"
run_check "validar backend/.npmrc" test -f "$ROOT_DIR/backend/.npmrc"
run_check "backend npm install (safe env, com timeout)" "${SAFE_ENV[@]}" bash -lc "cd '$ROOT_DIR/backend' && timeout 420 npm install --no-audit --no-fund" || true
run_check "backend npm test (safe env)" "${SAFE_ENV[@]}" bash -lc "cd '$ROOT_DIR/backend' && npm test -- --runInBand" || true

echo "\n## Rodada 3 - Frontend npm + build" | tee -a "$LOG_FILE"
run_check "frontend npm install" bash -lc "cd '$ROOT_DIR/frontend' && npm install --no-audit --no-fund"
run_check "frontend build" bash -lc "cd '$ROOT_DIR/frontend' && npm run build"

echo "\n## Rodada 4 - Execução de validação" | tee -a "$LOG_FILE"
run_check "backend demo-simple" node "$ROOT_DIR/backend/demo-simple.js"


echo "\nFim do loop de reparo. Veja $LOG_FILE" | tee -a "$LOG_FILE"
