# 🚀 COMPLETE STEP-BY-STEP GUIDE
## From Zero to Running Application - For Complete Beginners

---

## 📍 WHERE YOU ARE NOW

You are here: `/u/student/2024/cs24mtech14008/order-execution-engine/`

You have:
- ✅ Code written and compiled
- ✅ Node.js installed
- ✅ Dependencies installed
- ❌ No Docker (can't run locally on university server)

**Solution**: Deploy to cloud (Render.com) - it's FREE and EASY!

---

## 🎯 STEP-BY-STEP INSTRUCTIONS

### STEP 1: Push Your Code to GitHub

#### 1.1 Check if Git is Configured
```bash
git config --global user.name
git config --global user.email
```

If empty, configure it:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

#### 1.2 Initialize Git Repository
```bash
cd /u/student/2024/cs24mtech14008/order-execution-engine
git init
```

Expected output: `Initialized empty Git repository`

#### 1.3 Add All Files
```bash
git add .
```

No output = success!

#### 1.4 Commit Files
```bash
git commit -m "Initial commit: Order Execution Engine"
```

Expected output: Shows files committed

#### 1.5 Create GitHub Repository

**Open your web browser and go to:**
```
https://github.com/new
```

1. Repository name: `order-execution-engine`
2. Description: `DEX Order Execution Engine with WebSocket`
3. Visibility: **Public** (required for free deployment)
4. **DO NOT** check "Initialize with README"
5. Click "Create repository"

#### 1.6 Connect and Push

GitHub will show you commands. Copy the repository URL (looks like):
```
https://github.com/YOUR_USERNAME/order-execution-engine.git
```

Then run:
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/order-execution-engine.git
git push -u origin main
```

You'll be asked for:
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (not your password!)

**How to get Personal Access Token:**
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it: "Deploy Token"
4. Check: ✅ repo
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)
7. Paste it when asked for password

✅ **SUCCESS**: Your code is now on GitHub!

---

### STEP 2: Deploy to Render.com

#### 2.1 Create Render Account

**Open your browser and go to:**
```
https://render.com/
```

1. Click "Get Started" or "Sign Up"
2. Choose "Sign up with GitHub"
3. Authorize Render to access GitHub
4. ✅ Account created (FREE, no credit card needed)

#### 2.2 Create PostgreSQL Database

1. Click the **"New +"** button (top right)
2. Select **"PostgreSQL"**
3. Fill in:
   - Name: `order-execution-db`
   - Database: `orders`
   - User: `orderuser`
   - Region: **Oregon (US West)** or closest to you
   - Instance Type: **Free**
4. Click **"Create Database"**

**Wait 2-3 minutes** for database to provision...

When ready, you'll see:
- Status: **Available** (green)
- A section called "Connections"

5. **IMPORTANT**: Copy the **"Internal Database URL"**
   - It looks like: `postgresql://orderuser:LONG_PASSWORD@dpg-xxxxx/orders`
   - Click the 📋 copy icon
   - **Save this somewhere** (Notepad, text file)

#### 2.3 Create Redis Instance

1. Click **"New +"** again
2. Select **"Redis"**
3. Fill in:
   - Name: `order-execution-redis`
   - Region: **Same as database** (Oregon)
   - Plan: **Free** (30MB)
4. Click **"Create Redis"**

**Wait 1-2 minutes**...

When ready:
5. **IMPORTANT**: Copy the **"Internal Redis URL"**
   - It looks like: `redis://red-xxxxx:6379`
   - Click the 📋 copy icon
   - **Save this somewhere**

#### 2.4 Deploy API Service

1. Click **"New +"** again
2. Select **"Web Service"**
3. Click **"Connect a repository"**
4. Find and select your `order-execution-engine` repository
5. Click **"Connect"**

Fill in the form:
- **Name**: `order-execution-api`
- **Region**: Same as above (Oregon)
- **Branch**: `main`
- **Root Directory**: (leave empty)
- **Environment**: `Node`
- **Build Command**: 
  ```
  npm install && npm run build
  ```
- **Start Command**: 
  ```
  npm start
  ```
- **Plan**: **Free**

6. Scroll down to **"Environment Variables"**
7. Click **"Add Environment Variable"** and add these **ONE BY ONE**:

   ```
   Key: NODE_ENV
   Value: production
   ```
   Click "Add" (the + button)

   ```
   Key: PORT
   Value: 3000
   ```
   Click "Add"

   ```
   Key: DATABASE_URL
   Value: <PASTE THE POSTGRES URL YOU SAVED>
   ```
   Click "Add"

   ```
   Key: REDIS_URL
   Value: <PASTE THE REDIS URL YOU SAVED>
   ```
   Click "Add"

8. Click **"Create Web Service"**

**Wait 5-10 minutes** for deployment...

You'll see logs scrolling:
- "Cloning repository..."
- "npm install..."
- "npm run build..."
- "Starting server..."
- **"Server is running on port 3000"** ✅

9. **YOUR API IS LIVE!** Copy the URL at the top:
   ```
   https://order-execution-api-XXXX.onrender.com
   ```

#### 2.5 Deploy Worker Service

1. Click **"New +"** again
2. Select **"Background Worker"**
3. Connect your `order-execution-engine` repository again
4. Fill in:
   - **Name**: `order-execution-worker`
   - **Region**: Same as above
   - **Branch**: `main`
   - **Environment**: `Node`
   - **Build Command**: 
     ```
     npm install && npm run build
     ```
   - **Start Command**: 
     ```
     npm run worker
     ```
   - **Plan**: **Free**

5. Add the **SAME** environment variables as API:
   - `NODE_ENV=production`
   - `DATABASE_URL=<your postgres url>`
   - `REDIS_URL=<your redis url>`

6. Click **"Create Background Worker"**

**Wait 5 minutes** for deployment...

✅ **SUCCESS**: Your worker is running!

---

### STEP 3: Test Your Application

#### 3.1 Test Health Endpoint

**In your browser, go to:**
```
https://order-execution-api-XXXX.onrender.com/health
```
(Replace XXXX with your actual URL)

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-22T...",
  "database": "connected",
  "redis": "connected"
}
```

✅ If you see this, YOUR API IS WORKING!

#### 3.2 Test Order Submission

**Option A: Use Browser**

1. Download and open `demo-client.html` in your browser
2. Edit the WebSocket URL to your Render URL
3. Submit test orders

**Option B: Use Terminal (on university server)**

```bash
# Test health
curl https://order-execution-api-XXXX.onrender.com/health

# Submit an order
curl -X POST https://order-execution-api-XXXX.onrender.com/api/orders/execute \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "orderType": "market",
    "tokenIn": "SOL",
    "tokenOut": "USDC",
    "amountIn": 100
  }'
```

**Expected response:**
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "Order submitted successfully"
}
```

#### 3.3 Check Order Status

```bash
curl https://order-execution-api-XXXX.onrender.com/api/orders/YOUR_ORDER_ID
```

**Expected response:**
```json
{
  "id": "550e8400-...",
  "status": "confirmed",
  "selectedDex": "METEORA",
  "executedPrice": 148.7,
  "amountOut": 14870,
  ...
}
```

✅ **YOUR APPLICATION IS FULLY WORKING!**

---

### STEP 4: Record Demo Video

#### 4.1 What to Show in Video (2 minutes max)

1. **Show your Render dashboard** (0:15)
   - PostgreSQL running
   - Redis running
   - API service running
   - Worker running

2. **Show health endpoint in browser** (0:15)
   - Open your API URL + /health
   - Show database and redis connected

3. **Submit 3-5 orders** (0:45)
   - Use demo-client.html OR curl commands
   - Show orders going from pending → confirmed
   - Show WebSocket updates (if using demo-client)

4. **Show Render logs** (0:30)
   - Click on Worker service
   - Show logs of order processing
   - Point out DEX routing (Raydium vs Meteora)

5. **Explain briefly** (0:15)
   - "This is a DEX order execution engine"
   - "Market orders route through Raydium or Meteora"
   - "WebSocket provides real-time status updates"

#### 4.2 Recording Tools

**Windows:**
- Xbox Game Bar (Press Win + G)
- OBS Studio (free)

**Mac:**
- QuickTime Player (built-in)
- Screenshot app (Cmd + Shift + 5)

**Linux:**
- SimpleScreenRecorder
- OBS Studio

#### 4.3 Upload to YouTube

1. Go to: https://www.youtube.com/upload
2. Select your video file
3. Title: "DEX Order Execution Engine Demo"
4. Description: 
   ```
   Order Execution Engine demonstration
   Features: Market orders, DEX routing, WebSocket updates
   GitHub: https://github.com/YOUR_USERNAME/order-execution-engine
   ```
5. Visibility: **Unlisted** (or Public)
6. Click "Publish"
7. **Copy the video URL**

---

### STEP 5: Update README with URLs

#### 5.1 Edit README

**On university server:**
```bash
cd /u/student/2024/cs24mtech14008/order-execution-engine
nano README.md
```

#### 5.2 Add These Sections

Find the top of README.md and add:

```markdown
## 🌐 Live Demo

**API URL**: https://order-execution-api-XXXX.onrender.com

**Demo Video**: https://youtu.be/YOUR_VIDEO_ID

**Test it now**:
- Health: https://order-execution-api-XXXX.onrender.com/health
- Submit order: See API documentation below
```

Save and exit (Ctrl+X, Y, Enter)

#### 5.3 Push Changes

```bash
git add README.md
git commit -m "Add live demo URLs"
git push origin main
```

---

### STEP 6: Final Submission Checklist

Prepare these for submission:

✅ **1. GitHub Repository URL**
```
https://github.com/YOUR_USERNAME/order-execution-engine
```

✅ **2. Live API URL**
```
https://order-execution-api-XXXX.onrender.com
```

✅ **3. Demo Video URL**
```
https://youtu.be/YOUR_VIDEO_ID
```

✅ **4. Quick Test Commands**
```bash
# Health check
curl https://order-execution-api-XXXX.onrender.com/health

# Submit order
curl -X POST https://order-execution-api-XXXX.onrender.com/api/orders/execute \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","orderType":"market","tokenIn":"SOL","tokenOut":"USDC","amountIn":100}'
```

---

## 🎯 QUICK SUMMARY

### What You Need to Do (In Order):

1. ✅ **Push to GitHub** (5 minutes)
   - Create repository on github.com
   - Push your code

2. ✅ **Deploy to Render** (15 minutes)
   - Create PostgreSQL database
   - Create Redis instance
   - Deploy API service
   - Deploy Worker service

3. ✅ **Test Everything** (5 minutes)
   - Visit /health endpoint
   - Submit test orders
   - Verify they complete

4. ✅ **Record Video** (10 minutes)
   - Show Render dashboard
   - Submit orders
   - Show logs

5. ✅ **Upload & Update** (5 minutes)
   - Upload video to YouTube
   - Update README with URLs
   - Push changes

6. ✅ **Submit** (2 minutes)
   - GitHub URL
   - Live URL
   - Video URL

**Total Time**: ~45 minutes

---

## 🆘 TROUBLESHOOTING

### Issue: Git push asks for password
**Solution**: Use Personal Access Token from github.com/settings/tokens

### Issue: Render deployment fails
**Solution**: Check logs in Render dashboard, ensure environment variables are correct

### Issue: Health endpoint shows database error
**Solution**: 
1. Check DATABASE_URL is correct
2. Ensure PostgreSQL instance is "Available"
3. Wait 2-3 minutes after database creation

### Issue: Orders don't complete
**Solution**: 
1. Check Worker is running
2. Check Worker logs for errors
3. Ensure REDIS_URL is correct

### Issue: Can't access Render URLs
**Solution**: 
1. Wait 2 minutes after deployment
2. Check service is "Live" (green)
3. Check no build errors in logs

---

## 📞 NEED MORE HELP?

Check these files in your project:
- `DEPLOYMENT.md` - Detailed deployment guide
- `README.md` - Complete API documentation
- `VIDEO_GUIDE.md` - Video recording tips
- `QUICK_START.md` - Quick reference

---

## 🎉 YOU'RE DONE!

Once you complete all 6 steps, you'll have:
- ✅ Working API deployed to cloud
- ✅ Live demo URL
- ✅ Demo video on YouTube
- ✅ Everything ready to submit

**Good luck!** 🚀
