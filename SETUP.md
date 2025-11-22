# Setup Instructions

## Prerequisites Installation

### 1. Install Node.js 18+

**Option A: Using nvm (Recommended)**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell configuration
source ~/.bashrc

# Install Node.js 18
nvm install 18
nvm use 18

# Verify installation
node -v  # Should show v18.x.x
npm -v   # Should show 9.x.x or higher
```

**Option B: Using conda**
```bash
conda install -c conda-forge nodejs=18
```

**Option C: System Package Manager (Ubuntu/Debian)**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Install Docker & Docker Compose

**Ubuntu/Debian:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt-get install docker-compose-plugin
```

**Alternative: Manual PostgreSQL & Redis Installation**

If Docker is not available, install PostgreSQL and Redis directly:

```bash
# PostgreSQL 16
sudo apt-get install postgresql-16 postgresql-contrib

# Redis 7
sudo apt-get install redis-server

# Update .env with connection strings
DATABASE_URL=postgresql://postgres:password@localhost:5432/orderdb
REDIS_URL=redis://localhost:6379
```

## Quick Setup

### Automated Setup
```bash
cd order-execution-engine
chmod +x setup.sh
./setup.sh
```

### Manual Setup
```bash
# 1. Install dependencies
npm install

# 2. Start infrastructure
docker-compose up -d

# 3. Run database migrations
npm run migrate

# 4. Start API server (Terminal 1)
npm run dev

# 5. Start worker (Terminal 2)
npm run worker:dev
```

## Verify Installation

```bash
# Check API health
curl http://localhost:3000/health

# Should return:
# {
#   "status": "healthy",
#   "services": {
#     "database": "up",
#     "redis": "up"
#   }
# }
```

## Testing the System

### 1. Submit a Test Order
```bash
curl -X POST http://localhost:3000/api/orders/execute \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "orderType": "market",
    "tokenIn": "SOL",
    "tokenOut": "USDC",
    "amountIn": 100
  }'
```

### 2. Connect WebSocket to Monitor Order

Using `wscat` (install with `npm install -g wscat`):
```bash
# Replace ORDER_ID with the orderId from step 1
wscat -c ws://localhost:3000/ws/orders/ORDER_ID
```

You'll see real-time updates:
```json
{"orderId":"...","status":"pending","timestamp":"..."}
{"orderId":"...","status":"routing","timestamp":"..."}
{"orderId":"...","status":"building","data":{"selectedDex":"raydium"},"timestamp":"..."}
{"orderId":"...","status":"submitted","data":{"selectedDex":"raydium"},"timestamp":"..."}
{"orderId":"...","status":"confirmed","data":{"selectedDex":"raydium","txHash":"abc...","executedPrice":1.52,"amountOut":151.5},"timestamp":"..."}
```

### 3. Run Tests
```bash
npm test
```

### 4. Submit Concurrent Orders

Use the Postman collection:
1. Import `postman/order-execution.json`
2. Open "Submit Market Order" request
3. Use Collection Runner with 5-10 iterations
4. Watch logs to see queue processing

Or use a bash script:
```bash
# Submit 5 orders concurrently
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/orders/execute \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"user-$i\",\"orderType\":\"market\",\"tokenIn\":\"SOL\",\"tokenOut\":\"USDC\",\"amountIn\":$((RANDOM % 100 + 50))}" &
done
wait
```

## Troubleshooting

### Port 3000 Already in Use
```bash
# Find process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=8080
```

### Database Connection Error
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check connection
psql postgresql://orderuser:orderpass@localhost:5432/orderdb -c "SELECT 1"

# Recreate database
docker-compose down -v
docker-compose up -d
npm run migrate
```

### Redis Connection Error
```bash
# Check Redis is running
docker ps | grep redis

# Test connection
redis-cli -h localhost -p 6379 ping
```

### TypeScript Compilation Errors
```bash
# Clean and rebuild
rm -rf dist/
npm run build
```

## Development Workflow

### Hot Reload Development
```bash
# Terminal 1: API server with hot reload
npm run dev

# Terminal 2: Worker with hot reload
npm run worker:dev

# Terminal 3: Watch tests
npm run test:watch
```

### Database Management
```bash
# View database logs
docker-compose logs -f postgres

# Connect to database
docker exec -it order-engine-postgres psql -U orderuser -d orderdb

# SQL queries
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
```

### Queue Management
```bash
# View Redis keys
docker exec -it order-engine-redis redis-cli

# Check queue status
KEYS bull:order-execution:*
LLEN bull:order-execution:wait
```

## Production Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Environment Variables
Copy `.env.example` to `.env` and update:
```env
NODE_ENV=production
DATABASE_URL=your_production_db_url
REDIS_URL=your_production_redis_url
LOG_LEVEL=info
```

### Deploy to Cloud Platforms

**Render.com (Free Tier):**
1. Connect GitHub repository
2. Set environment variables
3. Build command: `npm install && npm run build && npm run migrate`
4. Start command: `npm start`
5. Add worker service with start command: `npm run worker`

**Railway.app:**
1. New Project → Deploy from GitHub
2. Add PostgreSQL and Redis plugins
3. Configure environment variables
4. Deploy

**Heroku:**
```bash
heroku create order-execution-engine
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini
git push heroku main
heroku run npm run migrate
```

## Next Steps

1. ✅ Complete setup using instructions above
2. ✅ Test API endpoints with Postman
3. ✅ Run test suite: `npm test`
4. ✅ Deploy to free hosting platform
5. ✅ Record demo video showing:
   - Submitting 5+ concurrent orders
   - WebSocket status updates
   - Queue processing logs
   - DEX routing decisions
6. ✅ Update README.md with:
   - Live deployment URL
   - YouTube video link

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review test output: `npm test -- --verbose`
- Consult README.md for full documentation
