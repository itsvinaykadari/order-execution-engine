# Project Structure

```
order-execution-engine/
├── .github/
│   └── workflows/
│       └── test.yml              # CI/CD pipeline for tests
├── src/
│   ├── config/
│   │   └── index.ts             # Environment configuration
│   ├── database/
│   │   ├── connection.ts        # PostgreSQL connection pool
│   │   ├── migrate.ts           # Migration runner
│   │   └── schema.sql           # Database schema
│   ├── dex/
│   │   ├── DexRouter.ts         # DEX routing logic
│   │   └── MockDexRouter.ts     # Mock Raydium/Meteora implementations
│   ├── models/
│   │   └── Order.ts             # Order model & database operations
│   ├── queue/
│   │   ├── orderQueue.ts        # BullMQ order queue
│   │   └── redis.ts             # Redis connection
│   ├── routes/
│   │   ├── health.ts            # Health check endpoint
│   │   ├── orders.ts            # Order API routes
│   │   └── websocket.ts         # WebSocket connection handler
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── utils/
│   │   └── logger.ts            # Pino logger configuration
│   ├── websocket/
│   │   └── manager.ts           # WebSocket subscription manager
│   ├── worker/
│   │   ├── index.ts             # Worker process entry
│   │   └── orderWorker.ts       # Order processing worker
│   ├── app.ts                   # Fastify app builder
│   └── server.ts                # Server entry point
├── tests/
│   ├── dex/
│   │   ├── DexRouter.test.ts    # DEX routing tests
│   │   └── MockDexRouter.test.ts # Mock DEX tests
│   ├── routes/
│   │   ├── health.test.ts       # Health endpoint tests
│   │   └── orders.test.ts       # Order API tests
│   ├── websocket/
│   │   └── manager.test.ts      # WebSocket manager tests
│   └── setup.ts                 # Test configuration
├── postman/
│   └── order-execution.json     # Postman collection
├── .env                         # Environment variables (gitignored)
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── DEPLOYMENT.md                # Deployment guide
├── Dockerfile                   # API server container
├── Dockerfile.worker            # Worker container
├── README.md                    # Main documentation
├── SETUP.md                     # Setup instructions
├── VIDEO_GUIDE.md               # Video recording guide
├── demo-client.html             # Web demo client
├── docker-compose.yml           # Local infrastructure
├── jest.config.js               # Jest test configuration
├── package.json                 # NPM dependencies
├── setup.sh                     # Automated setup script
├── submit-orders.sh             # Concurrent order test script
├── test-websocket.sh            # WebSocket test script
└── tsconfig.json                # TypeScript configuration
```

## Key Files Explained

### Core Application

- **src/server.ts**: Main entry point, starts Fastify server with WebSocket support
- **src/app.ts**: Configures Fastify with routes and plugins
- **src/worker/index.ts**: Worker process for processing queued orders

### API Routes

- **src/routes/orders.ts**: 
  - POST /api/orders/execute - Submit order
  - GET /api/orders/:orderId - Get order details
  - GET /api/orders - List user orders

- **src/routes/websocket.ts**: 
  - GET /ws/orders/:orderId - WebSocket connection for real-time updates

- **src/routes/health.ts**: 
  - GET /health - Service health check

### DEX Integration

- **src/dex/DexRouter.ts**: Fetches quotes from both DEXs, selects best price
- **src/dex/MockDexRouter.ts**: Simulates Raydium (0.3% fee) and Meteora (0.2% fee)

### Queue System

- **src/queue/orderQueue.ts**: BullMQ queue for order processing
- **src/worker/orderWorker.ts**: Processes orders with retry logic and DEX execution

### WebSocket

- **src/websocket/manager.ts**: Manages WebSocket subscriptions and emits order updates

### Database

- **src/database/schema.sql**: Orders table schema
- **src/models/Order.ts**: Order CRUD operations

### Configuration

- **src/config/index.ts**: Loads environment variables
- **.env**: Local configuration (DATABASE_URL, REDIS_URL, etc.)

### Testing

- **tests/**: Unit and integration tests (15+ tests)
- **jest.config.js**: Jest configuration

### Deployment

- **docker-compose.yml**: Local PostgreSQL + Redis
- **Dockerfile**: API server containerization
- **Dockerfile.worker**: Worker containerization
- **.github/workflows/test.yml**: CI pipeline

### Documentation

- **README.md**: Main documentation with API reference
- **SETUP.md**: Installation and setup guide
- **DEPLOYMENT.md**: Cloud deployment instructions
- **VIDEO_GUIDE.md**: Demo video recording guide

### Tools

- **demo-client.html**: Browser-based demo UI
- **postman/order-execution.json**: Postman API collection
- **setup.sh**: Automated setup script
- **submit-orders.sh**: Test concurrent order submission
- **test-websocket.sh**: WebSocket connection tester

## Component Interactions

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP POST
       ▼
┌─────────────────────┐
│  Fastify API        │
│  (src/routes)       │
└──────┬──────────────┘
       │ Enqueue
       ▼
┌─────────────────────┐      ┌──────────────┐
│   BullMQ Queue      │◄─────┤   Redis      │
│ (src/queue)         │      └──────────────┘
└──────┬──────────────┘
       │ Process
       ▼
┌─────────────────────┐
│   Worker            │
│ (src/worker)        │
└──────┬──────────────┘
       │ Route
       ▼
┌─────────────────────┐
│   DEX Router        │
│ (src/dex)           │
├─────────────────────┤
│ • Raydium (0.3%)    │
│ • Meteora (0.2%)    │
└──────┬──────────────┘
       │ Update Status
       ▼
┌─────────────────────┐      ┌──────────────┐
│  PostgreSQL         │◄─────┤  Order Model │
│ (Order History)     │      │ (src/models) │
└─────────────────────┘      └──────────────┘
       │
       ▼
┌─────────────────────┐
│  WebSocket Manager  │
│ (src/websocket)     │
└──────┬──────────────┘
       │ Emit Update
       ▼
┌─────────────────────┐
│   Connected         │
│   Clients           │
└─────────────────────┘
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.6
- **Framework**: Fastify 4.28
- **WebSocket**: @fastify/websocket 10.0
- **Queue**: BullMQ 5.13
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **ORM**: Native pg driver

### Testing
- **Framework**: Jest 29
- **Coverage**: ts-jest

### DevOps
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Deployment**: Render, Railway, Heroku, Fly.io

### Development
- **Build**: tsx (TypeScript execution)
- **Linting**: TypeScript strict mode
- **Logging**: Pino

## Getting Started

See [SETUP.md](./SETUP.md) for detailed installation instructions.

Quick start:
```bash
npm install
npm run docker:up
npm run migrate
npm run dev           # Terminal 1
npm run worker:dev    # Terminal 2
```

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for cloud deployment options.

## Demo

- Open `demo-client.html` in browser
- Or use Postman collection in `postman/`
- Or use curl: `curl -X POST http://localhost:3000/api/orders/execute -H "Content-Type: application/json" -d '{"userId":"test","orderType":"market","tokenIn":"SOL","tokenOut":"USDC","amountIn":100}'`
