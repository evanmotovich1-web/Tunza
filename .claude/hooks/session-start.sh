#!/bin/bash
# SessionStart hook: feed the vault (the project's second brain) into every
# session's context, and make sure web sessions can run the quality gates.
set -euo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

# --- The vault digest (always, every session) -------------------------------
if [ -f vault/INDEX.md ]; then
  echo "=== TUNZA VAULT (vault/INDEX.md) — read the pages your task touches; write back before finishing (see CLAUDE.md) ==="
  cat vault/INDEX.md
  latest_note=$(ls -1 vault/sessions/*.md 2>/dev/null | sort | tail -1 || true)
  if [ -n "${latest_note:-}" ]; then
    echo ""
    echo "=== LATEST SESSION NOTE (${latest_note}) ==="
    cat "$latest_note"
  fi
fi

# --- Dependencies (web sessions only; local sessions manage their own) ------
if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ] && [ -f package.json ]; then
  if [ ! -d node_modules ]; then
    echo ""
    echo "=== Installing npm dependencies (first run in this container) ==="
    npm install --no-audit --no-fund 2>&1 | tail -2
  fi
fi
