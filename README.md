# Order Execution Engine

A high-performance DEX order execution engine built with Node.js, TypeScript, Fastify, and BullMQ. This system processes cryptocurrency orders with intelligent DEX routing between Raydium and Meteora, providing real-time status updates via WebSocket.

## 🌐 Live Demo

**API URL**: https://order-execution-api.onrender.com

**Health Check**: https://order-execution-api.onrender.com/health

**GitHub Repository**: https://github.com/itsvinaykadari/order-execution-engine

### Quick Test
```bash
# Submit an order
curl -X POST https://order-execution-api.onrender.com/api/orders/execute \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","orderType":"market","tokenIn":"SOL","tokenOut":"USDC","amountIn":100}'
```

## 🎯 Order Type: Market Order

**Why Market Order?**
Market orders are chosen for this implementation because they:
- Execute immediately at the current market price, demonstrating real-time routing logic
- Simplify the proof-of-concept while showcasing all core architecture components
- Provide clear, observable results for testing DEX price comparison

**Extension to Other Order Types:**
The engine can be extended to support Limit and Sniper orders:
- **Limit Orders**: Add a price watcher service that monitors token prices in Redis and triggers execution when target price is reached
- **Sniper Orders**: Implement event listeners for token launches/migrations using Solana WebSocket subscriptions, with instant order submission on detection

## 🏗️ Architecture

```
User Request → Fastify API → PostgreSQL (Order Storage)
                ↓
            BullMQ Queue → Worker Pool (10 concurrent)
                ↓
            DEX Router (Raydium + Meteora)
                ↓
            WebSocket (Status Updates)
```

### Key Components

- **Fastify Server**: HTTP API with WebSocket support on the same connection
- **BullMQ Queue**: Job queue with exponential backoff retry (1s, 2s, 4s)
- **Mock DEX Routers**: Simulates Raydium (0.3% fee) and Meteora (0.2% fee) with realistic delays
- **PostgreSQL**: Persistent order history and state
- **Redis**: Queue backend and active order cache
- **WebSocket Manager**: Real-time status streaming to clients

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7

### Installation

```bash
# Clone the repository
cd order-execution-engine

# Install dependencies
npm install

# Start infrastructure (PostgreSQL + Redis)
npm run docker:up

# Run database migrations
npm run migrate

# Start the API server
npm run dev

# In a separate terminal, start the worker
npm run worker:dev
```

The API will be available at `http://localhost:3000`

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### Submit Order
```bash
POST /api/orders/execute
Content-Type: application/json

{
  "userId": "user-123",
  "orderType": "market",
  "tokenIn": "SOL",
  "tokenOut": "USDC",
  "amountIn": 100
}

Response (202 Accepted):
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "Order accepted and queued for execution...",
  "websocketUrl": "/ws/orders/550e8400-e29b-41d4-a716-446655440000"
}
```

### Get Order Details
```bash
GET /api/orders/:orderId
```

### Get User Orders
```bash
GET /api/orders?userId=user-123&limit=50
```

### WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:3000/ws/orders/550e8400-e29b-41d4-a716-446655440000');

ws.on('message', (data) => {
  const update = JSON.parse(data);
  console.log(update);
  // {
  //   "orderId": "550e8400-...",
  //   "status": "routing|building|submitted|confirmed|failed",
  //   "data": { "selectedDex": "raydium", "txHash": "abc...", ... },
  //   "timestamp": "2025-11-22T..."
  // }
});
```

## 🔄 Order Lifecycle

1. **pending** → Order received and queued
2. **routing** → Comparing prices from Raydium and Meteora
3. **building** → Creating swap transaction on selected DEX
4. **submitted** → Transaction sent to network
5. **confirmed** → Transaction successful (includes txHash, executedPrice, amountOut)
6. **failed** → Execution failed (includes error reason)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

**Test Coverage:**
- ✅ Mock DEX router unit tests (quote generation, swap execution, slippage handling)
- ✅ DEX routing logic tests (price comparison, best selection)
- ✅ API endpoint tests (validation, error handling)
- ✅ WebSocket manager tests (subscription, emission, cleanup)
- ✅ Health check integration tests

Total: 15+ unit and integration tests

## 📊 DEX Routing Logic

The system fetches quotes from both Raydium and Meteora in parallel:

```typescript
// Raydium: 0.3% fee, 200ms latency
// Meteora: 0.2% fee, 200ms latency

const bestQuote = await dexRouter.getBestQuote('SOL', 'USDC', 100);
// Returns the DEX with highest estimated output after fees
```

**Routing Decisions:**
- Compares `estimatedOutput = amountIn * price * (1 - fee)`
- Selects DEX with higher output
- Logs routing decision for transparency
- Applies 2% slippage tolerance on execution

## 🔧 Configuration

Environment variables (`.env`):

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://orderuser:orderpass@localhost:5432/orderdb

# Redis
REDIS_URL=redis://localhost:6379

# Queue
QUEUE_CONCURRENCY=10
MAX_RETRY_ATTEMPTS=3

# Mock DEX
MOCK_DEX_ENABLED=true
RAYDIUM_DELAY_MS=200
METEORA_DELAY_MS=200
SWAP_DELAY_MS=2500
FAILURE_RATE=0.05
```

## 🚦 Queue Management

- **Concurrency**: 10 workers processing orders in parallel
- **Rate Limiting**: 100 orders per minute
- **Retry Logic**: Exponential backoff (1s → 2s → 4s)
- **Max Retries**: 3 attempts before marking as failed
- **Dead Letter Queue**: Failed orders stored with failure reason for analysis

## 📦 Postman Collection

Import `postman/order-execution.json` into Postman to test all API endpoints.

**Test Concurrent Orders:**
1. Import collection
2. Select "Submit Market Order"
3. Use Postman Runner to execute 5-10 times simultaneously
4. Monitor logs to see queue processing and DEX routing

## 🎥 Demo Video

📹 [YouTube Demo Link](YOUR_VIDEO_LINK_HERE)

The video demonstrates:
- Submitting 5 concurrent orders
- WebSocket streaming all status updates (pending → routing → confirmed)
- DEX routing decisions in console logs
- Queue processing multiple orders
- Error handling and retry logic

## 🗄️ Database Schema

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    order_type VARCHAR(20) NOT NULL,
    token_in VARCHAR(100) NOT NULL,
    token_out VARCHAR(100) NOT NULL,
    amount_in DECIMAL(20, 8) NOT NULL,
    amount_out DECIMAL(20, 8),
    selected_dex VARCHAR(20),
    status VARCHAR(20) NOT NULL,
    tx_hash VARCHAR(255),
    executed_price DECIMAL(20, 8),
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔐 Production Considerations

**For Real Devnet/Mainnet Deployment:**
- Add wallet keypair management (use secure key storage)
- Implement Solana RPC connection pooling
- Add rate limiting per user
- Implement authentication (JWT/API keys)
- Use real Raydium SDK (`@raydium-io/raydium-sdk-v2`)
- Use real Meteora SDK (`@meteora-ag/dynamic-amm-sdk`)
- Add monitoring with Prometheus/Grafana
- Implement circuit breakers for DEX failures
- Add transaction confirmation polling

## 📈 Performance

- **Throughput**: 100 orders/minute with 10 concurrent workers
- **Latency**: ~2.5-3.5s per order (mock DEX simulation)
- **Retry Success Rate**: ~95% (5% simulated failure rate)
- **WebSocket**: Supports 1000+ concurrent connections

## 🛠️ Development Scripts

```bash
npm run dev          # Start API server in watch mode
npm run worker:dev   # Start worker in watch mode
npm run build        # Compile TypeScript to JavaScript
npm run start        # Run compiled code
npm run migrate      # Run database migrations
npm run docker:up    # Start Docker services
npm run docker:down  # Stop Docker services
npm test             # Run test suite
```

## 📝 License

MIT

## 🤝 Contributing

This is a technical assessment project. For questions or issues, please contact the repository owner.

---

**Tech Stack**: Node.js, TypeScript, Fastify, BullMQ, PostgreSQL, Redis, Jest, WebSocket

**Live Demo**: [Deployment URL will be added here]

**Repository**: https://github.com/itsvinaykadari/order-execution-engine
