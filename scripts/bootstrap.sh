#!/usr/bin/env bash
set -euo pipefail

echo "🌙 Moonlight Logger - bootstrap rápido"

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js não encontrado. Instale Node 18+ e rode novamente."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm não encontrado."
  exit 1
fi

echo "📦 Instalando backend (modo leve, sem devDependencies)..."
(cd backend && npm install --omit=dev)

echo "📦 Instalando frontend (modo leve, sem devDependencies)..."
(cd frontend && npm install --omit=dev)

cat <<MSG
✅ Bootstrap concluído.
Próximos passos:
  1) Suba MongoDB (e Redis opcional): docker compose up -d mongo redis
  2) Inicie backend: cd backend && npm run dev
  3) Inicie frontend: cd frontend && npm run dev
MSG
