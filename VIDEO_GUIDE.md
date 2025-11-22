# Video Recording Guide

## Demo Video Requirements

Create a 1-2 minute video demonstrating:

1. ✅ Order flow through the system
2. ✅ Submit 3-5 orders simultaneously
3. ✅ WebSocket showing all status updates (pending → routing → confirmed)
4. ✅ DEX routing decisions in logs/console
5. ✅ Queue processing multiple orders
6. ✅ Design decisions explanation

## Recording Setup

### Tools

**Screen Recording (Choose one):**
- **OBS Studio** (Free, cross-platform): https://obsproject.com/
- **Loom** (Free, easy): https://www.loom.com/
- **QuickTime** (macOS): Built-in
- **SimpleScreenRecorder** (Linux): `sudo apt install simplescreenrecorder`

**Video Editing (Optional):**
- **DaVinci Resolve** (Free): https://www.blackmagicdesign.com/products/davinciresolve
- **iMovie** (macOS): Built-in
- **Kdenlive** (Linux): https://kdenlive.org/

### Preparation

1. **Clean Terminal Setup**
   ```bash
   # Terminal 1: API server logs
   cd order-execution-engine
   npm run dev

   # Terminal 2: Worker logs
   npm run worker:dev

   # Terminal 3: Test client
   open demo-client.html
   # or
   python3 -m http.server 8080
   # then open http://localhost:8080/demo-client.html
   ```

2. **Browser Setup**
   - Open demo client in one tab
   - Open browser DevTools (F12) → Network → WS filter
   - Arrange windows side-by-side: Client + Terminal logs

3. **Postman Setup** (Alternative)
   - Import `postman/order-execution.json`
   - Set up Collection Runner for concurrent requests
   - Keep Postman Console visible

## Recording Script

### Introduction (10 seconds)
```
"Hi, this is the Order Execution Engine - a DEX order router 
built with Node.js, TypeScript, and Fastify. It routes orders 
between Raydium and Meteora DEXs with real-time WebSocket updates."
```

### System Overview (15 seconds)
Show architecture diagram or walk through files:
```
"The system uses BullMQ for job queuing, PostgreSQL for persistence,
Redis for caching, and WebSocket for live status updates. Orders flow
through: API → Queue → Worker → DEX Router → WebSocket"
```

### Live Demo (45-60 seconds)

1. **Health Check** (5 seconds)
   ```bash
   curl http://localhost:3000/health
   ```
   Show database and Redis connections are healthy.

2. **Submit Single Order** (10 seconds)
   - Click "Submit Order" in demo client
   - Point out: "Order accepted immediately, returns 202 with orderId"
   - Show WebSocket connection established

3. **Status Updates** (15 seconds)
   - Highlight status changes in real-time:
     - `pending` - "Order queued"
     - `routing` - "Comparing Raydium and Meteora prices"
     - `building` - "Selected best DEX based on output"
     - `submitted` - "Transaction being processed"
     - `confirmed` - "Swap executed successfully"
   - Show DEX selection in logs: "Raydium output: 152.3, Meteora: 151.8 → Selected Raydium"

4. **Concurrent Orders** (15 seconds)
   - Click "Submit 5 Orders" button
   - Show terminal logs processing multiple orders in parallel
   - Point out: "Queue processing 5 concurrent orders with different token pairs"
   - Highlight different DEX selections for each order

5. **Error Handling** (10 seconds) [Optional]
   - Show a failed order (5% mock failure rate)
   - Point out retry logic in logs: "Attempt 1 failed, retrying in 1s..."
   - Show final failure status after 3 attempts

### Design Decisions (20 seconds)
```
"I chose Market Orders for immediate execution - demonstrates routing
logic clearly. The system can extend to Limit Orders by adding price
watchers, or Sniper Orders with token launch event listeners.

Mock implementation allows rapid testing without blockchain complexity.
For production, integrate real Raydium/Meteora SDKs with Solana RPC."
```

### Conclusion (5 seconds)
```
"The system handles 100 orders/minute with 10 concurrent workers,
exponential backoff retry, and persistent order history. 
Thanks for watching!"
```

## Recording Checklist

### Before Recording
- [ ] API server running (`npm run dev`)
- [ ] Worker running (`npm run worker:dev`)
- [ ] Docker services healthy (`docker-compose ps`)
- [ ] Demo client loaded in browser
- [ ] Terminal font size increased for visibility
- [ ] Browser zoom at 110-125% for readability
- [ ] Close unnecessary applications
- [ ] Mute notifications
- [ ] Test microphone (if narrating)

### During Recording
- [ ] Show health check response
- [ ] Submit single order
- [ ] Show WebSocket status updates in real-time
- [ ] Highlight DEX routing decision in logs
- [ ] Submit 5 concurrent orders
- [ ] Show queue processing in parallel
- [ ] Zoom in on important parts
- [ ] Speak clearly and at moderate pace
- [ ] Keep video under 2 minutes

### After Recording
- [ ] Trim any dead air at start/end
- [ ] Add title card (optional): "Order Execution Engine Demo"
- [ ] Add captions/subtitles (optional but helpful)
- [ ] Export as MP4 (1080p, 30fps)
- [ ] Upload to YouTube

## Upload to YouTube

1. **Go to**: https://studio.youtube.com/

2. **Upload Video**
   - Click "Create" → "Upload videos"
   - Select your recorded MP4

3. **Video Details**
   ```
   Title: Order Execution Engine - DEX Router with Real-time Updates
   
   Description:
   DEX Order Execution Engine demonstrating:
   - Market order processing with Raydium/Meteora routing
   - Real-time WebSocket status updates
   - Concurrent order queue processing with BullMQ
   - Exponential backoff retry logic
   - Mock DEX implementation with realistic delays
   
   Tech Stack: Node.js, TypeScript, Fastify, PostgreSQL, Redis, BullMQ
   
   Repository: https://github.com/itsvinaykadari/order-execution-engine
   Live Demo: [Add your deployed URL]
   
   Timestamps:
   0:00 - Introduction
   0:10 - System Architecture
   0:25 - Single Order Flow
   0:40 - Concurrent Orders
   1:00 - DEX Routing Logic
   1:20 - Design Decisions
   
   #Solana #DEX #OrderRouter #WebSocket #NodeJS #TypeScript
   ```

4. **Settings**
   - Visibility: **Unlisted** (visible only with link) or **Public**
   - Not made for kids: **No**
   - Category: **Science & Technology**
   - Tags: `solana, dex, order-execution, websocket, nodejs, typescript, raydium, meteora`

5. **Thumbnail** (Optional)
   - Create custom thumbnail with title
   - Recommended size: 1280x720px
   - Tools: Canva, Figma, Photoshop

6. **Publish**
   - Click "Publish"
   - Copy video URL
   - Update README.md with link

## Example Terminal Commands for Demo

```bash
# Terminal 1: Start API with enhanced logging
NODE_ENV=development LOG_LEVEL=debug npm run dev

# Terminal 2: Start Worker
npm run worker:dev

# Terminal 3: Submit concurrent orders
bash submit-orders.sh 5

# Terminal 4: Monitor health
watch -n 2 'curl -s http://localhost:3000/health | jq'

# Terminal 5: WebSocket monitoring
wscat -c ws://localhost:3000/ws/orders/ORDER_ID
```

## Tips for Great Demo Video

1. **Keep It Short**: 90-120 seconds ideal
2. **Show, Don't Tell**: Let the logs and UI do the talking
3. **Highlight Key Features**: Focus on routing logic and real-time updates
4. **Use Zoom**: Zoom in on important console output
5. **Smooth Transitions**: Practice flow before recording
6. **Clear Audio**: Use good microphone or add captions
7. **Professional**: No background noise, clean desktop
8. **Engaging**: Show enthusiasm for your work!

## Alternative: Screenshot Demo

If video recording is difficult, create an animated GIF:

```bash
# Install peek (Linux)
sudo apt install peek

# Or use LICEcap (cross-platform)
# https://www.cockos.com/licecap/

# Record 30-60 second demo
# Add to README.md as:
# ![Demo](demo.gif)
```

## Final Checklist

- [ ] Video recorded (1-2 minutes)
- [ ] Shows concurrent order processing
- [ ] WebSocket updates visible
- [ ] DEX routing decisions clear
- [ ] Uploaded to YouTube
- [ ] Video link added to README.md
- [ ] Video set to Unlisted or Public
- [ ] Tested video link works

Good luck with your demo! 🎥✨
