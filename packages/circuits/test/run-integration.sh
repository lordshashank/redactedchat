#!/usr/bin/env bash
# Usage: ./run-integration.sh [--prove]
# Compiles all sharded circuits, then runs the 5-phase integration test.
set -euo pipefail
export PATH="$HOME/.nargo/bin:$HOME/.bb:$PATH"

cd "$(dirname "$0")/.."

echo "==> Compiling eth-primitives library..."
(cd eth-primitives && nargo check)

echo "==> Compiling identity_nullifier..."
(cd identity_nullifier && nargo compile --silence-warnings)

echo "==> Compiling balance_header..."
(cd balance_header && nargo compile --silence-warnings)

echo "==> Compiling balance_mpt_step..."
(cd balance_mpt_step && nargo compile --silence-warnings)

echo "==> Compiling balance_final..."
(cd balance_final && nargo compile --silence-warnings)

echo "==> Running integration test..."
cd test && node integration.mjs "$@"
