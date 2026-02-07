# Reparações: npm + execução do projeto

## Falhas destrinchadas

1. **Conflito de rede/proxy no npm do ambiente**
   - Em ambiente padrão, chamadas npm podem falhar com `403 Forbidden`.
   - Sem proxy explícito, parte das chamadas funciona, mas há intermitência de `ENETUNREACH`.

2. **Backend com sensibilidade maior à instalação completa**
   - `npm install` do backend exige resolver muitas dependências e no ambiente atual isso é instável.

3. **Frontend não compilava (corrigido na rodada anterior)**
   - Faltavam componentes `components/logs/*` e havia conflito de `.gitignore`.

## Reparações aplicadas nesta rodada

- **Ajuste de npm para backend**
  - Criado `backend/.npmrc` com hardening para rede instável:
    - `proxy=null`
    - `https-proxy=null`
    - `strict-ssl=false`
    - retries e timeouts de fetch reduzidos.
- **Script de reparo reforçado** (`scripts/repair-npm-loop.sh`)
  - Passou a usar **safe env** removendo variáveis de proxy problemáticas.
  - Inclui validação de `backend/.npmrc`.
  - Executa rodadas com diagnóstico, install/test backend, install/build frontend e demo backend.
- **Versionamento do ajuste npm**
  - Atualizado `.gitignore` para permitir comitar `backend/.npmrc`.

## O que já ficou “dando certo”

- `npm view express version` funciona no modo safe env.
- `npm install` no frontend funciona.
- `npm run build` no frontend funciona.
- execução `node backend/demo-simple.js` funciona.

## Pendência do ambiente

- `npm install` completo no backend ainda é intermitente/instável por rede (não por erro de código), mas agora existe fluxo repetível para retestar e coletar evidências em `reports/npm-repair-loop.log`.
