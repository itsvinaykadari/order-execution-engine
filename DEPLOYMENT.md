# Deployment Guide

## Free Hosting Options

This guide covers deploying the Order Execution Engine to free hosting platforms.

## Option 1: Render.com (Recommended)

**Free Tier**: 750 hours/month, PostgreSQL (90 days), Redis (30 days)

### Setup Steps

1. **Create Account**
   - Sign up at [render.com](https://render.com)
   - Connect your GitHub account

2. **Deploy PostgreSQL**
   - Dashboard → New → PostgreSQL
   - Name: `order-engine-db`
   - Database: `orderdb`
   - User: `orderuser`
   - Note the connection string

3. **Deploy Redis**
   - Dashboard → New → Redis
   - Name: `order-engine-redis`
   - Note the connection string

4. **Deploy API Server**
   - Dashboard → New → Web Service
   - Connect repository: `order-execution-engine`
   - Name: `order-api`
   - Environment: `Node`
   - Build Command: `npm install && npm run build && npm run migrate`
   - Start Command: `npm start`
   - Add Environment Variables:
     ```
     NODE_ENV=production
     PORT=3000
     DATABASE_URL=<postgres_connection_string>
     REDIS_URL=<redis_connection_string>
     QUEUE_CONCURRENCY=5
     MAX_RETRY_ATTEMPTS=3
     MOCK_DEX_ENABLED=true
     LOG_LEVEL=info
     ```

5. **Deploy Worker Service**
   - Dashboard → New → Background Worker
   - Connect same repository
   - Name: `order-worker`
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/worker/index.js`
   - Use same environment variables as API

6. **Test Deployment**
   ```bash
   curl https://order-api.onrender.com/health
   ```

### Render.com Configuration File

Create `render.yaml` in repository root:

```yaml
services:
  - type: web
    name: order-api
    env: node
    plan: free
    buildCommand: npm install && npm run build && npm run migrate
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: order-engine-db
          property: connectionString
      - key: REDIS_URL
        fromDatabase:
          name: order-engine-redis
          property: connectionString

  - type: worker
    name: order-worker
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: node dist/worker/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: order-engine-db
          property: connectionString
      - key: REDIS_URL
        fromDatabase:
          name: order-engine-redis
          property: connectionString

databases:
  - name: order-engine-db
    plan: free
    databaseName: orderdb
    user: orderuser

  - name: order-engine-redis
    plan: free
```

## Option 2: Railway.app

**Free Tier**: $5 credit/month (no credit card required for trial)

### Setup Steps

1. **Create Account**
   - Sign up at [railway.app](https://railway.app)

2. **New Project**
   - Dashboard → New Project → Deploy from GitHub
   - Select `order-execution-engine` repository

3. **Add Services**
   - Add PostgreSQL plugin
   - Add Redis plugin
   - Railway auto-configures `DATABASE_URL` and `REDIS_URL`

4. **Configure API Service**
   - Settings → Build:
     ```
     Build Command: npm install && npm run build
     Start Command: npm start
     ```
   - Add environment variables:
     ```
     NODE_ENV=production
     PORT=$PORT
     QUEUE_CONCURRENCY=5
     ```

5. **Add Worker Service**
   - New Service → From GitHub → Same repo
   - Settings → Start Command: `node dist/worker/index.js`

6. **Generate Domain**
   - Settings → Networking → Generate Domain

## Option 3: Heroku

**Free Tier**: Ended in 2022, but Eco Dynos ($5/month) available

### Setup Steps

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create order-execution-engine

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Add Redis
heroku addons:create heroku-redis:mini

# Configure
heroku config:set NODE_ENV=production
heroku config:set QUEUE_CONCURRENCY=5
heroku config:set MOCK_DEX_ENABLED=true

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate

# Scale worker
heroku ps:scale worker=1

# View logs
heroku logs --tail
```

### Procfile

Create `Procfile` in root:
```
web: npm start
worker: node dist/worker/index.js
```

## Option 4: Fly.io

**Free Tier**: 3 VMs, 3GB persistent storage

### Setup Steps

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app
fly launch

# Add PostgreSQL
fly postgres create

# Add Redis
fly redis create

# Deploy
fly deploy

# Scale worker
fly scale count worker=1
```

### fly.toml

```toml
app = "order-execution-engine"

[build]
  builder = "heroku/buildpacks:20"

[[services]]
  internal_port = 3000
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

[env]
  NODE_ENV = "production"
```

## Post-Deployment Testing

### 1. Health Check
```bash
curl https://your-app.onrender.com/health
```

### 2. Submit Test Order
```bash
curl -X POST https://your-app.onrender.com/api/orders/execute \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "orderType": "market",
    "tokenIn": "SOL",
    "tokenOut": "USDC",
    "amountIn": 100
  }'
```

### 3. WebSocket Test
```bash
# Install wscat if not already installed
npm install -g wscat

# Connect to WebSocket (replace ORDER_ID)
wscat -c wss://your-app.onrender.com/ws/orders/ORDER_ID
```

### 4. Load Test with Artillery
```bash
npm install -g artillery

# Create artillery.yml
cat > artillery.yml << EOF
config:
  target: 'https://your-app.onrender.com'
  phases:
    - duration: 60
      arrivalRate: 5
scenarios:
  - name: 'Submit orders'
    flow:
      - post:
          url: '/api/orders/execute'
          json:
            userId: 'load-test-user'
            orderType: 'market'
            tokenIn: 'SOL'
            tokenOut: 'USDC'
            amountIn: 100
EOF

# Run load test
artillery run artillery.yml
```

## Monitoring & Logging

### Render.com
- Dashboard → Service → Logs (live tail)
- Metrics tab shows CPU, memory, requests

### Railway.app
- Project → Service → Logs
- Metrics panel shows usage

### Setup Logging Service (Optional)

**Logtail (Free 1GB/month)**
```bash
npm install @logtail/node

# Add to logger.ts
import { Logtail } from '@logtail/node';
const logtail = new Logtail(process.env.LOGTAIL_TOKEN);
```

## Troubleshooting

### Build Failures
- Check Node version: Must be 18+
- Verify `package.json` scripts
- Check build logs for missing dependencies

### Database Connection Issues
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/db`
- Check firewall/network rules
- Ensure migrations ran: `heroku run npm run migrate`

### Worker Not Processing Orders
- Check worker logs
- Verify `REDIS_URL` is correct
- Ensure worker service is running: `heroku ps`

### WebSocket Connection Fails
- Check if platform supports WebSocket (most do)
- Verify WebSocket URL uses `wss://` (not `ws://`)
- Check CORS settings

## Cost Optimization

1. **Free Tier Limits**
   - Render: 750 hours/month (shut down during idle)
   - Railway: $5 credit/month
   - Fly.io: 3 VMs free

2. **Reduce Costs**
   - Lower `QUEUE_CONCURRENCY` to 3-5
   - Reduce mock delays (`SWAP_DELAY_MS=1500`)
   - Use single worker instance
   - Enable auto-sleep on Render

3. **Database Storage**
   - Clean old orders periodically
   - Limit `removeOnComplete` and `removeOnFail` in BullMQ

## Next Steps

1. ✅ Deploy to chosen platform
2. ✅ Test all endpoints
3. ✅ Update README.md with live URL
4. ✅ Record demo video
5. ✅ Submit deliverables

## Support Resources

- Render Docs: https://render.com/docs
- Railway Docs: https://docs.railway.app
- Heroku Docs: https://devcenter.heroku.com
- Fly.io Docs: https://fly.io/docs
