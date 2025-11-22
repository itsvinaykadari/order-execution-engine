#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Start both API server and worker in the same container
# This allows running both on the free tier

# Start worker in background
node dist/worker/index.js &

# Start API server in foreground
node dist/server.js
