#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Debug: Show current directory and list files
echo "Current directory: $(pwd)"
echo "Contents of current directory:"
ls -la
echo "Contents of dist directory:"
ls -la dist/ || echo "dist directory not found"

# Verify files exist
if [ ! -f "dist/server.js" ]; then
    echo "ERROR: dist/server.js not found!"
    exit 1
fi

if [ ! -f "dist/worker/index.js" ]; then
    echo "ERROR: dist/worker/index.js not found!"
    exit 1
fi

# Start both API server and worker in the same container
# This allows running both on the free tier

# Start worker in background
node dist/worker/index.js &

# Start API server in foreground
node dist/server.js
