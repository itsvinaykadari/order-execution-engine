# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18+ (`nvm install 18` or `conda install nodejs=18`)
- Docker Desktop (for PostgreSQL + Redis)

## 1-Minute Setup

```bash
# Navigate to project
cd /u/student/2024/cs24mtech14008/order-execution-engine

# Install dependencies
npm install

# Start infrastructure
docker-compose up -d

# Run migrations
npm run migrate

# Start API (Terminal 1)
npm run dev

# Start Worker (Terminal 2)  
npm run worker:dev
```

## Test It

```bash
# Health check
curl http://localhost:3000/health

# Submit order
curl -X POST http://localhost:3000/api/orders/execute \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","orderType":"market","tokenIn":"SOL","tokenOut":"USDC","amountIn":100}'

# Run tests
npm test

# Open demo
open demo-client.html
```

## File Guide

| Need to... | Open this file |
|------------|----------------|
| Understand setup | `SETUP.md` |
| Deploy to cloud | `DEPLOYMENT.md` |
| Record video | `VIDEO_GUIDE.md` |
| Understand structure | `PROJECT_STRUCTURE.md` |
| See implementation details | `IMPLEMENTATION_SUMMARY.md` |
| Next steps | `FINAL_NOTES.md` |
| API reference | `README.md` |

## Key Commands

```bash
# Development
npm run dev              # Start API server
npm run worker:dev       # Start worker
npm run build            # Compile TypeScript
npm test                 # Run tests

# Infrastructure
npm run docker:up        # Start PostgreSQL + Redis
npm run docker:down      # Stop services
npm run migrate          # Run DB migrations

# Testing
./submit-orders.sh 5     # Submit 5 concurrent orders
./test-websocket.sh <id> # Test WebSocket connection
open demo-client.html    # Open web demo
```

## Deployment Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Services running locally
- [ ] Tests passing (`npm test`)
- [ ] Health endpoint works
- [ ] Deploy to Render/Railway (see `DEPLOYMENT.md`)
- [ ] Update `README.md` with live URL
- [ ] Record demo video (see `VIDEO_GUIDE.md`)
- [ ] Upload to YouTube
- [ ] Update `README.md` with video link
- [ ] Push to GitHub
- [ ] Submit all deliverables

## Architecture

```
Client → API → Queue → Worker → DEX Router → WebSocket
         ↓                        ↓              ↓
      Postgres              Mock Raydium    Subscribers
                            Mock Meteora
         ↓
       Redis
```

## API Endpoints

- `POST /api/orders/execute` - Submit order
- `GET /api/orders/:id` - Get order
- `GET /api/orders?userId=X` - List orders
- `GET /health` - Health check
- `GET /ws/orders/:id` - WebSocket

## Status Flow

```
pending → routing → building → submitted → confirmed
                                        ↓
                                     failed
```

## Help

**Can't find Node.js?**
```bash
# Install via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
```

**Docker not working?**
```bash
# Install PostgreSQL + Redis manually
sudo apt-get install postgresql-16 redis-server
# Update .env with connection strings
```

**Port 3000 in use?**
```bash
# Change port in .env
PORT=8080
```

**Need help?**
- Read `FINAL_NOTES.md` for complete guide
- Check `SETUP.md` for troubleshooting
- Review logs: `docker-compose logs -f`

## Next Step

👉 **Read `FINAL_NOTES.md`** for detailed instructions

Good luck! 🎉
