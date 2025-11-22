#!/bin/bash

# Validation Script for Order Execution Engine
# This script checks if all issues are resolved after npm install

echo "╔════════════════════════════════════════════════════════╗"
echo "║  Order Execution Engine - Validation Script          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Check function
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $1"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $1"
        ((FAILED++))
    fi
}

echo "1️⃣  Checking Node.js installation..."
node --version > /dev/null 2>&1
check "Node.js is installed"

echo ""
echo "2️⃣  Checking npm installation..."
npm --version > /dev/null 2>&1
check "npm is installed"

echo ""
echo "3️⃣  Checking if node_modules exists..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ PASS${NC}: node_modules directory exists"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}: node_modules not found. Run 'npm install' first!"
    ((FAILED++))
fi

echo ""
echo "4️⃣  Checking critical dependencies..."

# Check if dependencies are installed
check_dep() {
    if [ -d "node_modules/$1" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $1 installed"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $1 missing"
        ((FAILED++))
    fi
}

check_dep "fastify"
check_dep "bullmq"
check_dep "ioredis"
check_dep "pg"
check_dep "ws"
check_dep "@fastify/websocket"

echo ""
echo "5️⃣  Checking type definitions..."
check_dep "@types/node"
check_dep "@types/jest"
check_dep "@types/pg"
check_dep "@types/ws"

echo ""
echo "6️⃣  Checking TypeScript compilation..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}: TypeScript compiles successfully"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARN${NC}: TypeScript compilation has errors"
    echo "   Run 'npm run build' to see details"
    ((FAILED++))
fi

echo ""
echo "7️⃣  Checking configuration files..."

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $1 exists"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $1 missing"
        ((FAILED++))
    fi
}

check_file "package.json"
check_file "tsconfig.json"
check_file ".env"
check_file "docker-compose.yml"

echo ""
echo "8️⃣  Checking source files..."
SOURCE_COUNT=$(find src -name "*.ts" | wc -l)
if [ "$SOURCE_COUNT" -eq 18 ]; then
    echo -e "${GREEN}✅ PASS${NC}: All 18 source files present"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARN${NC}: Expected 18 source files, found $SOURCE_COUNT"
fi

echo ""
echo "9️⃣  Checking test files..."
TEST_COUNT=$(find tests -name "*.test.ts" | wc -l)
if [ "$TEST_COUNT" -eq 5 ]; then
    echo -e "${GREEN}✅ PASS${NC}: All 5 test files present"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARN${NC}: Expected 5 test files, found $TEST_COUNT"
fi

echo ""
echo "🔟 Checking documentation..."
DOC_COUNT=$(ls *.md 2>/dev/null | wc -l)
if [ "$DOC_COUNT" -ge 6 ]; then
    echo -e "${GREEN}✅ PASS${NC}: Documentation files present ($DOC_COUNT files)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARN${NC}: Expected at least 6 docs, found $DOC_COUNT"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "║               VALIDATION SUMMARY                     ║"
echo "═══════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  🎉 ALL CHECKS PASSED! PROJECT IS READY! 🎉      ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start Docker services: npm run docker:up"
    echo "2. Run migrations: npm run migrate"
    echo "3. Start API: npm run dev"
    echo "4. Start worker: npm run worker:dev"
    echo "5. Run tests: npm test"
    exit 0
else
    echo -e "${RED}╔═══════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ⚠️  SOME CHECKS FAILED - REVIEW ABOVE ⚠️         ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Common fixes:"
    echo "1. Run: npm install"
    echo "2. Copy .env.example to .env"
    echo "3. Check Docker is installed"
    exit 1
fi
