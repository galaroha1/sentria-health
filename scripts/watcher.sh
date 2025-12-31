#!/bin/bash
TARGET_FILE="ai_model_trained/checkpoint_archive_5.json"
PROCESS_NAME="run_training_cli.ts"

echo "[WATCHER] Monitoring for $TARGET_FILE..."

while true; do
  if [ -f "$TARGET_FILE" ]; then
    echo "[WATCHER] File detected! Archive 5 Complete."
    echo "[WATCHER] Waiting 60s for file write & final logs..."
    sleep 60
    
    echo "[WATCHER] Terminating training process..."
    # Kill the node process running the training script
    pkill -f "$PROCESS_NAME"
    
    echo "[WATCHER] Training stopped safely."
    exit 0
  fi
  sleep 60
done
