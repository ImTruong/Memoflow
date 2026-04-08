#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

node "$SCRIPT_DIR/seed_grammar_extra.js" | docker exec -i memoflow-mysql mysql --default-character-set=utf8mb4 -uroot -p12345678 memoflow