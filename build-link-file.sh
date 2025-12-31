#!/usr/bin/env bash
set -u

run_step() {
  local description="$1"
  shift
  echo "▶ $description"
  "$@" || {
    echo "ERROR: $description failed"
    exit 1
  }
  echo "SUCCESS: $description"
  echo
}

echo "Starting Yarn build/link process..."
echo

run_step "Running yarn build" yarn build

# ---- Find entry file ----
ENTRY_FILE=""

if [ -f dist/index.js ]; then
  ENTRY_FILE="dist/index.js"
elif [ -f dist/src/index.js ]; then
  ENTRY_FILE="dist/src/index.js"
else
  echo "ERROR: No CLI entry file found in dist/"
  exit 1
fi

run_step "Making CLI executable ($ENTRY_FILE)" chmod +x "$ENTRY_FILE"
run_step "Running yarn unlink" yarn unlink
run_step "Running yarn link" yarn link

echo "All steps completed successfully!"
