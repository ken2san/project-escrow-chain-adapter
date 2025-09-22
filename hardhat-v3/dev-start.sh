#!/bin/bash

# Hardhat v3 Development Environment Startup Script
# Auto-starts Hardhat network, deploys real contract, and starts React frontend

set -e  # Exit on any error

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "🚀 Starting Hardhat v3 Development Environment..."
echo "📁 Project root: $PROJECT_ROOT"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a process is running on a specific port
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to find and kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}⚠️  Killing existing process on port $port (PID: $pid)${NC}"
        kill -9 $pid 2>/dev/null || true
        sleep 2
    fi
}

# 1. Check and start Hardhat Network (port 8545)
echo -e "\n${BLUE}🔧 Step 1: Checking Hardhat Network (port 8545)...${NC}"

if check_port 8545; then
    echo -e "${GREEN}✅ Hardhat network already running on port 8545 - Skipping${NC}"
else
    echo -e "${YELLOW}🔄 Starting Hardhat network...${NC}"

    # Start Hardhat node in background using local binary
    ./node_modules/.bin/hardhat node > hardhat-network.log 2>&1 &
    HARDHAT_PID=$!

    # Wait for network to be ready
    echo -e "${YELLOW}⏳ Waiting for Hardhat network to start...${NC}"
    for i in {1..30}; do
        if check_port 8545; then
            echo -e "${GREEN}✅ Hardhat network started successfully!${NC}"
            break
        fi
        sleep 1
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ Failed to start Hardhat network${NC}"
            exit 1
        fi
    done
fi

# 2. Deploy Escrow contract using canonical deploy script
echo -e "\n${BLUE}🔧 Step 2: Deploying Escrow contract (canonical script)...${NC}"
echo -e "${YELLOW}🚀 Running canonical deployment script (scripts/deploy.mjs)...${NC}"

# Prefer environment RPC_URL if provided; fall back to localhost
DEPLOY_RPC=${RPC_URL:-http://127.0.0.1:8545}

# Run the canonical deploy script (node ESM script)
if RPC_URL="$DEPLOY_RPC" node scripts/deploy.mjs; then
    echo -e "${GREEN}✅ Escrow deployment (deploy.mjs) successful!${NC}"
else
    echo -e "${RED}❌ Escrow deployment (deploy.mjs) failed${NC}"
    echo -e "${YELLOW}ℹ️  You can fall back to the legacy script: npx hardhat run scripts/real-deploy.mjs --network localhost${NC}"
    exit 1
fi

# 2.1 Award initial points (retry loop)
echo -e "\n${BLUE}🔧 Step 2.1: Awarding initial points to test accounts...${NC}"
MAX_RETRIES=3
attempt=1
awarded=false
while [ $attempt -le $MAX_RETRIES ]; do
    echo -e "${YELLOW}🔁 Attempt $attempt to award points...${NC}"
    if npx hardhat run scripts/award-points.mjs --network localhost; then
        echo -e "${GREEN}✅ Initial points awarded successfully!${NC}"
        awarded=true
        break
    else
        echo -e "${RED}⚠️  Award attempt $attempt failed${NC}"
        attempt=$((attempt+1))
        sleep 1
    fi
done
if [ "$awarded" != "true" ]; then
    echo -e "${YELLOW}⚠️  Could not automatically award points after ${MAX_RETRIES} attempts.${NC}"
    echo -e "${YELLOW}ℹ️  You can run manually: npx hardhat run scripts/award-points.mjs --network localhost${NC}"
fi

# 3. Check and start React Frontend (port 3000)
echo -e "\n${BLUE}🔧 Step 3: Checking React Frontend (port 3000)...${NC}"

if check_port 3000; then
    echo -e "${GREEN}✅ React frontend already running on port 3000 - Skipping${NC}"
    echo -e "${BLUE}🌐 Opening browser...${NC}"

    # Open browser (macOS)
    if command -v open >/dev/null 2>&1; then
        open "http://localhost:3000"
    # Open browser (Linux)
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open "http://localhost:3000"
    # Open browser (Windows WSL)
    elif command -v cmd.exe >/dev/null 2>&1; then
        cmd.exe /c start "http://localhost:3000"
    else
        echo -e "${YELLOW}⚠️  Please open http://localhost:3000 in your browser${NC}"
    fi
else
    echo -e "${YELLOW}🔄 Starting React frontend...${NC}"

    cd frontend

    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing dependencies...${NC}"
        npm install
    fi

    # Start React in background
    npm start > ../react-frontend.log 2>&1 &
    REACT_PID=$!

    cd ..

    # Wait for React to be ready and open browser
    echo -e "${YELLOW}⏳ Waiting for React frontend to start...${NC}"
    for i in {1..60}; do
        if check_port 3000; then
            echo -e "${GREEN}✅ React frontend started successfully!${NC}"
            echo -e "${BLUE}🌐 Opening browser...${NC}"

            # Open browser
            if command -v open >/dev/null 2>&1; then
                open "http://localhost:3000"
            elif command -v xdg-open >/dev/null 2>&1; then
                xdg-open "http://localhost:3000"
            elif command -v cmd.exe >/dev/null 2>&1; then
                cmd.exe /c start "http://localhost:3000"
            else
                echo -e "${YELLOW}⚠️  Please open http://localhost:3000 in your browser${NC}"
            fi
            break
        fi
        sleep 1
        if [ $i -eq 60 ]; then
            echo -e "${RED}❌ Failed to start React frontend${NC}"
            exit 1
        fi
    done
fi

echo -e "\n${GREEN}🎉 Development environment ready!${NC}"
echo -e "${BLUE}📋 Services running:${NC}"
echo -e "   🔧 Hardhat Network: http://localhost:8545"
echo -e "   🌐 React Frontend:  http://localhost:3000"
echo -e "\n${YELLOW}📝 Logs:${NC}"
echo -e "   Hardhat: ./hardhat-network.log"
echo -e "   React:   ./react-frontend.log"
echo -e "\n${YELLOW}⏹️  To stop services:${NC}"
echo -e "   ./dev-stop.sh"

echo -e "\n${GREEN}🚀 Happy coding!${NC}"