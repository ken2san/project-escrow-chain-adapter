#!/bin/bash

# Hardhat v3 Development Environment Stop Script
# Stops Hardhat network and React frontend

set -e

echo "🛑 Stopping Hardhat v3 Development Environment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to kill processes on specific port
kill_port() {
    local port=$1
    local service_name=$2
    local pids=$(lsof -ti:$port 2>/dev/null || true)

    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}🔄 Stopping $service_name on port $port...${NC}"
        echo $pids | xargs kill -9 2>/dev/null || true
        sleep 1

        # Check if still running
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${RED}❌ Failed to stop $service_name${NC}"
        else
            echo -e "${GREEN}✅ $service_name stopped${NC}"
        fi
    else
        echo -e "${BLUE}ℹ️  $service_name is not running on port $port${NC}"
    fi
}

# Stop React frontend (port 3000)
echo -e "\n${BLUE}🔧 Stopping React Frontend...${NC}"
kill_port 3000 "React Frontend"

# Stop Hardhat network (port 8545)
echo -e "\n${BLUE}🔧 Stopping Hardhat Network...${NC}"
kill_port 8545 "Hardhat Network"

# Also kill by process name as fallback
echo -e "\n${BLUE}🔧 Killing remaining processes...${NC}"

# Show current processes before cleanup
echo -e "${BLUE}🔍 Current processes:${NC}"
ps aux | grep -E "(hardhat|react|node.*8545|node.*3000)" | grep -v grep | head -5 || echo "No relevant processes found"

# Kill hardhat node processes - multiple patterns
hardhat_pids=$(ps aux | grep -v grep | grep -E "(hardhat node|node.*hardhat)" | awk '{print $2}' || true)
if [ ! -z "$hardhat_pids" ]; then
    echo -e "${YELLOW}🔄 Killing hardhat node processes: $hardhat_pids${NC}"
    echo $hardhat_pids | xargs kill -TERM 2>/dev/null || true
    sleep 2
    # Force kill if still running
    remaining_hardhat=$(ps aux | grep -v grep | grep -E "(hardhat node|node.*hardhat)" | awk '{print $2}' || true)
    if [ ! -z "$remaining_hardhat" ]; then
        echo $remaining_hardhat | xargs kill -9 2>/dev/null || true
    fi
    echo -e "${GREEN}✅ Hardhat processes cleaned${NC}"
else
    echo -e "${BLUE}ℹ️  No hardhat processes found${NC}"
fi

# Kill react-scripts processes - multiple patterns
react_pids=$(ps aux | grep -v grep | grep -E "(react-scripts|npm start|yarn start)" | awk '{print $2}' || true)
if [ ! -z "$react_pids" ]; then
    echo -e "${YELLOW}🔄 Killing react-scripts processes: $react_pids${NC}"
    echo $react_pids | xargs kill -TERM 2>/dev/null || true
    sleep 2
    # Force kill if still running
    remaining_react=$(ps aux | grep -v grep | grep -E "(react-scripts|npm start|yarn start)" | awk '{print $2}' || true)
    if [ ! -z "$remaining_react" ]; then
        echo $remaining_react | xargs kill -9 2>/dev/null || true
    fi
    echo -e "${GREEN}✅ React processes cleaned${NC}"
else
    echo -e "${BLUE}ℹ️  No react processes found${NC}"
fi

# Final check - show remaining processes
echo -e "\n${BLUE}🔍 Remaining processes after cleanup:${NC}"
remaining=$(ps aux | grep -E "(hardhat|react|node.*8545|node.*3000)" | grep -v grep | head -3 || echo "")
if [ ! -z "$remaining" ]; then
    echo "$remaining"
    echo -e "${YELLOW}⚠️  Some processes may still be running${NC}"
else
    echo -e "${GREEN}✅ All development processes cleaned up${NC}"
fi

# Clean up log files
echo -e "\n${BLUE}🧹 Cleaning up log files...${NC}"
if [ -f "hardhat-network.log" ]; then
    rm hardhat-network.log
    echo -e "${GREEN}✅ Removed hardhat-network.log${NC}"
fi

if [ -f "react-frontend.log" ]; then
    rm react-frontend.log
    echo -e "${GREEN}✅ Removed react-frontend.log${NC}"
fi

echo -e "\n${GREEN}🎉 Development environment stopped!${NC}"
echo -e "${BLUE}💡 To restart, run: ./dev-start.sh${NC}"