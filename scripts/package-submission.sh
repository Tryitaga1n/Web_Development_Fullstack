#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT="$ROOT_DIR/Auctionary-submission.zip"

cd "$ROOT_DIR"

if [[ ! -f screencast.mp4 ]]; then
    echo "Missing screencast.mp4 in $ROOT_DIR" >&2
    echo "Record the walkthrough before creating the final submission." >&2
    exit 1
fi

rm -f "$OUTPUT"

zip -r "$OUTPUT" \
    backend frontend screencast.mp4 \
    -x '*/node_modules/*' \
    -x '*/dist/*' \
    -x '*/.env' \
    -x '*.sqlite' \
    -x '*/.DS_Store'

echo "Created $OUTPUT"
