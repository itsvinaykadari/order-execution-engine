#!/bin/bash

# Submit multiple concurrent orders for testing
# Usage: ./submit-orders.sh [num_orders]

NUM_ORDERS=${1:-5}
BASE_URL=${2:-"http://localhost:3000"}

echo "🚀 Submitting $NUM_ORDERS concurrent orders to $BASE_URL"
echo ""

TOKENS=("SOL:USDC" "ETH:USDC" "BTC:USDC" "BONK:SOL" "RAY:USDC")
ORDER_IDS=()

for i in $(seq 1 $NUM_ORDERS); do
    # Random token pair
    TOKEN_PAIR=${TOKENS[$((RANDOM % ${#TOKENS[@]}))]}
    IFS=':' read -r TOKEN_IN TOKEN_OUT <<< "$TOKEN_PAIR"
    
    # Random amount between 50-200
    AMOUNT=$((RANDOM % 151 + 50))
    
    USER_ID="test-user-$i"
    
    echo "[$i/$NUM_ORDERS] Submitting order: $USER_ID - $AMOUNT $TOKEN_IN → $TOKEN_OUT"
    
    RESPONSE=$(curl -s -X POST "$BASE_URL/api/orders/execute" \
        -H "Content-Type: application/json" \
        -d "{
            \"userId\": \"$USER_ID\",
            \"orderType\": \"market\",
            \"tokenIn\": \"$TOKEN_IN\",
            \"tokenOut\": \"$TOKEN_OUT\",
            \"amountIn\": $AMOUNT
        }" &)
    
    # Extract orderId from response (will be available after all complete)
    ORDER_IDS+=("$RESPONSE")
done

# Wait for all requests to complete
wait

echo ""
echo "✅ All $NUM_ORDERS orders submitted"
echo ""
echo "📊 Check order status:"
echo "  GET $BASE_URL/api/orders/<orderId>"
echo ""
echo "🔌 Connect to WebSocket for real-time updates:"
echo "  wscat -c ws://localhost:3000/ws/orders/<orderId>"
echo ""
