#!/bin/bash

# Hardhat v3 Development Environment Startup Script
# A# 2. Deploy contract automatically
echo -e "\n${BLUE}🔧 Step 2: Deploying PointExchange contract...${NC}"
echo -e "${YELLOW}🚀 Running automated deployment...${NC}"

# Run the deployment script
if ./scripts/fixed-deploy.sh; then
    echo -e "${GREEN}✅ Contract deployment successful!${NC}"
else
    echo -e "${RED}❌ Contract deployment failed${NC}"
    exit 1
fi

# Hardhat v3 Development Environment Startup Script
# Auto-starts Hardhat network and React frontend with duplicate checking

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

# 2. Setup contract configuration (skip deployment for now)
echo -e "\n${BLUE}🔧 Step 2: Setting up contract configuration...${NC}"
echo -e "${YELLOW}� Using existing contract configuration...${NC}"

# Use the existing static configuration for now
node scripts/save-deployed-address.mjs || {
    echo -e "${YELLOW}⚠️  Using default contract configuration${NC}"
}

echo -e "${GREEN}✅ Contract configuration ready${NC}"

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
echo -e "   pkill -f 'hardhat node'"
echo -e "   pkill -f 'react-scripts start'"

echo -e "\n${GREEN}🚀 Happy coding!${NC}"