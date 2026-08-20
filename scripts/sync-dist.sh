#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)

mkdir -p "$REPO_DIR/dist"
cp "$REPO_DIR/room-card.js" "$REPO_DIR/dist/room-card.js"

echo "Synced room-card.js to dist/room-card.js"
