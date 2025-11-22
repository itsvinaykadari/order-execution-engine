#!/bin/bash

# Start both API server and worker in the same container
# This allows running both on the free tier

# Start worker in background
node dist/worker/index.js &

# Start API server in foreground
node dist/server.js
