# 🚀 Deploy Without Docker - Quick Guide

Since Docker is not available on your server, follow these steps to deploy directly to the cloud.

## Option 1: Render.com (Recommended - FREE)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (free account)
3. No credit card required!

### Step 2: Create PostgreSQL Database
1. Click "New +" → "PostgreSQL"
2. Name: `order-execution-db`
3. Database: `orders`
4. User: `orderuser`
5. Region: Choose closest to you
6. Plan: **Free** (selected by default)
7. Click "Create Database"
8. **Copy the "Internal Database URL"** (starts with `postgresql://`)

### Step 3: Create Redis Instance
1. Click "New +" → "Redis"
2. Name: `order-execution-redis`
3. Region: Same as database
4. Plan: **Free** (30MB)
5. Click "Create Redis"
6. **Copy the "Internal Redis URL"** (starts with `redis://`)

### Step 4: Deploy API Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configuration:
   ```
   Name: order-execution-api
   Environment: Node
   Region: Same as above
   Branch: main
   Build Command: npm install && npm run build
   Start Command: npm start
   Plan: Free
   ```
4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=<paste Internal Database URL from Step 2>
   REDIS_URL=<paste Internal Redis URL from Step 3>
   ```
5. Click "Create Web Service"

### Step 5: Deploy Worker Service
1. Click "New +" → "Background Worker"
2. Connect same repository
3. Configuration:
   ```
   Name: order-execution-worker
   Environment: Node
   Branch: main
   Build Command: npm install && npm run build
   Start Command: npm run worker
   Plan: Free
   ```
4. Add same environment variables as API
5. Click "Create Background Worker"

### Step 6: Test Your Deployment
Once deployed, Render gives you a URL like:
```
https://order-execution-api.onrender.com
```

Test it:
```bash
curl https://order-execution-api.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-22T...",
  "database": "connected",
  "redis": "connected"
}
```

---

## Option 2: Railway.app (Also FREE)

### Quick Deploy
1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway auto-detects Node.js and sets everything up
6. Add PostgreSQL and Redis from "New" button
7. Environment variables are auto-configured

**Free tier**: $5 credit/month (enough for development)

---

## Option 3: Local Testing Without Docker

If you want to test locally without Docker:

### Install PostgreSQL Locally
```bash
# Using conda (you already have this)
conda install -c conda-forge postgresql

# Start PostgreSQL
pg_ctl -D ~/postgres_data -l logfile start

# Create database
createdb orders
```

### Install Redis Locally
```bash
# Using conda
conda install -c conda-forge redis

# Start Redis
redis-server --daemonize yes
```

### Update .env for Local
```bash
DATABASE_URL=postgresql://localhost:5432/orders
REDIS_URL=redis://localhost:6379
```

### Run Services
```bash
# Terminal 1: API
npm run dev

# Terminal 2: Worker
npm run worker:dev
```

---

## ⚡ Quick Start (Choose One)

### For Deployment (Recommended)
```bash
# 1. Push code to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/itsvinaykadari/order-execution-engine.git
git push -u origin main

# 2. Deploy on Render.com (follow steps above)
# 3. Test with provided URL
```

### For Local Testing (If you have time)
```bash
# 1. Install PostgreSQL + Redis via conda
conda install -c conda-forge postgresql redis

# 2. Start services
pg_ctl -D ~/postgres_data -l logfile start
redis-server --daemonize yes

# 3. Run application
npm run dev
```

---

## 🎯 Recommended Path

**For your assignment submission:**
1. ✅ Deploy to Render.com (takes 10 minutes)
2. ✅ Get live URL for demo
3. ✅ Record demo video using live deployment
4. ✅ Submit GitHub repo + live URL + video

**Why Render.com?**
- ✅ No Docker needed
- ✅ No credit card needed
- ✅ Free PostgreSQL + Redis
- ✅ Auto-deploys from GitHub
- ✅ Provides HTTPS URL
- ✅ Perfect for demos

---

## 📝 Notes

- **slurm-login01** is a shared HPC login node - Docker won't work there
- Cloud deployment is faster and easier than local setup
- Free tiers are perfect for assignments/demos
- You can always add Docker later for production

---

## 🆘 Need Help?

Refer to:
- `DEPLOYMENT.md` - Full deployment guide for all platforms
- `README.md` - Complete API documentation
- `VIDEO_GUIDE.md` - How to record demo video

**Next Step**: Deploy to Render.com (10 minutes) → Record demo → Submit!
