#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -i :$1 > /dev/null; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on a port
kill_port() {
    echo -e "${YELLOW}Killing process on port $1...${NC}"
    # Try to find the process
    echo -e "${YELLOW}Processes using port $1:${NC}"
    lsof -i :$1
    
    # Kill the process
    sudo kill -9 $(lsof -t -i:$1) 2>/dev/null || true
    
    # Wait and check if port is still in use
    sleep 2
    if check_port $1; then
        echo -e "${RED}Warning: Port $1 is still in use after kill attempt${NC}"
        echo -e "${YELLOW}Trying alternative method...${NC}"
        sudo fuser -k $1/tcp 2>/dev/null || true
        sleep 2
        if check_port $1; then
            echo -e "${RED}Failed to free port $1. Please check manually.${NC}"
            return 1
        fi
    fi
    echo -e "${GREEN}Port $1 is now free${NC}"
}

echo -e "${BLUE}Starting all services...${NC}"

# Kill any existing processes on required ports 
kill_port 3000
kill_port 7001
kill_port 8080

# Wait a moment to ensure ports are free
sleep 2

# Start Next.js application
echo -e "${BLUE}Starting Next.js application...${NC}"
if check_port 3000; then
    echo -e "${RED}Port 3000 is still in use. Please check manually.${NC}"
    echo -e "${YELLOW}Running lsof -i :3000 to check what's using the port:${NC}"
    lsof -i :3000
    exit 1
fi

# Start Next.js in development mode
echo -e "${BLUE}Building Next.js application...${NC}"
npm run build || {
    echo -e "${RED}Build failed. Please check the errors above.${NC}"
    exit 1
}

echo -e "${BLUE}Starting Next.js server...${NC}"
npm run start &
NEXT_PID=$!
sleep 5  # Wait for Next.js to start

# Check if Next.js is running
if ! check_port 3000; then
    echo -e "${RED}Next.js failed to start on port 3000${NC}"
    exit 1
fi

echo -e "${GREEN}Next.js started with PID $NEXT_PID${NC}"

# Start FRP client
echo -e "${BLUE}Starting FRP client...${NC}"
if check_port 7001; then
    echo -e "${RED}Port 7001 is still in use. Please check manually.${NC}"
    echo -e "${YELLOW}Running lsof -i :7001 to check what's using the port:${NC}"
    lsof -i :7001
    exit 1
fi

# Check if frpc binary exists
if ! command -v frpc &> /dev/null; then
    echo -e "${RED}FRP client binary not found. Please install FRP first.${NC}"
    exit 1
fi

# Check frpc.toml exists
if [ ! -f "./frpc.toml" ]; then
    echo -e "${RED}frpc.toml configuration file not found.${NC}"
    exit 1
fi

# Show FRP configuration
echo -e "${BLUE}FRP Configuration:${NC}"
cat ./frpc.toml

# Start FRP client with verbose logging
echo -e "${BLUE}Starting FRP client with verbose logging...${NC}"
frpc -c ./frpc.toml -v 2>&1 | tee frpc.log &
FRPC_PID=$!
sleep 3  # Wait for FRP to establish connection

# Check if FRP client is running
if ! ps -p $FRPC_PID > /dev/null; then
    echo -e "${RED}FRP client failed to start${NC}"
    echo -e "${YELLOW}Checking FRP client logs:${NC}"
    cat frpc.log
    exit 1
fi

echo -e "${GREEN}FRP client started with PID $FRPC_PID${NC}"

# Save PIDs to a file for later use
echo "NEXT_PID=$NEXT_PID" > ~/.service_pids
echo "FRPC_PID=$FRPC_PID" >> ~/.service_pids

echo -e "${GREEN}All services started successfully!${NC}"
echo -e "${BLUE}Next.js is running on http://localhost:3000${NC}"
echo -e "${BLUE}FRP client is running and connected to the server${NC}"
echo -e "${BLUE}Your site should be accessible at http://47.106.67.151${NC}"

# Test the connection
echo -e "${BLUE}Testing connection to the server...${NC}"
curl -I http://47.106.67.151 || echo -e "${YELLOW}Warning: Could not connect to server. Please check the server status.${NC}" 