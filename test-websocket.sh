#!/bin/bash

# WebSocket Test Client
# Usage: ./test-websocket.sh <ORDER_ID>

ORDER_ID=${1:-"test-order-id"}
WS_URL="ws://localhost:3000/ws/orders/$ORDER_ID"

echo "🔌 Connecting to WebSocket: $WS_URL"
echo "Press Ctrl+C to disconnect"
echo ""

# Check if websocat is installed
if ! command -v websocat &> /dev/null; then
    echo "⚠️  websocat not found. Install with:"
    echo "  cargo install websocat"
    echo "  or"
    echo "  brew install websocat (macOS)"
    echo ""
    echo "Alternative: Use wscat"
    echo "  npm install -g wscat"
    echo "  wscat -c $WS_URL"
    exit 1
fi

# Connect to WebSocket
websocat "$WS_URL"
