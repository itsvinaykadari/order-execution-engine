#!/bin/bash

# Order Execution Engine - Setup Script

echo "🚀 Order Execution Engine Setup"
echo "================================"

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo ""
    echo "Please install Node.js 18+ using one of these methods:"
    echo ""
    echo "Option 1 - Using nvm (recommended):"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "  source ~/.bashrc"
    echo "  nvm install 18"
    echo "  nvm use 18"
    echo ""
    echo "Option 2 - Using conda:"
    echo "  conda install -c conda-forge nodejs=18"
    echo ""
    echo "Option 3 - System package manager:"
    echo "  # For Ubuntu/Debian:"
    echo "  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "  sudo apt-get install -y nodejs"
    echo ""
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js detected: $NODE_VERSION"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🐳 Starting Docker services (PostgreSQL + Redis)..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "⚠️  Docker services failed to start. Please ensure Docker is installed and running."
    echo "Alternatively, you can install PostgreSQL and Redis manually:"
    echo "  - PostgreSQL 16: https://www.postgresql.org/download/"
    echo "  - Redis 7: https://redis.io/download"
    exit 1
fi

# Wait for services to be ready
echo ""
echo "⏳ Waiting for database to be ready..."
sleep 5

# Run migrations
echo ""
echo "🗄️  Running database migrations..."
npm run migrate

if [ $? -ne 0 ]; then
    echo "❌ Database migration failed"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📖 Next steps:"
echo "  1. Start the API server:    npm run dev"
echo "  2. In another terminal:     npm run worker:dev"
echo "  3. Test the health endpoint: curl http://localhost:3000/health"
echo ""
echo "📚 Documentation: See README.md for full API reference"
echo "📮 Postman Collection: Import postman/order-execution.json"
echo ""
