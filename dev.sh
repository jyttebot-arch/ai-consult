#!/bin/bash
trap 'kill 0' EXIT

cd "$(dirname "$0")"

echo "Starting backend on http://localhost:8000 ..."
(cd backend && uvicorn app.main:app --reload) &

echo "Starting frontend on http://localhost:3000 ..."
(cd frontend && pnpm dev) &

wait
