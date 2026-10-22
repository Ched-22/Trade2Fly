#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
    wait "$BACKEND_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

echo "→ Iniciando backend em http://localhost:3000 ..."
(cd "$ROOT/backend" && npm run start:dev) &
BACKEND_PID=$!

echo "→ Aguardando backend..."
for _ in $(seq 1 30); do
  if curl -sf "http://localhost:3000/api/listings" >/dev/null 2>&1; then
    echo "→ Backend pronto."
    break
  fi
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "Erro: backend encerrou antes de ficar pronto." >&2
    exit 1
  fi
  sleep 1
done

if ! curl -sf "http://localhost:3000/api/listings" >/dev/null 2>&1; then
  echo "Aviso: backend ainda não respondeu; o frontend pode mostrar erros de proxy até subir." >&2
fi

echo "→ Iniciando frontend em http://localhost:5173 ..."
cd "$ROOT/frontend"
npm run dev
