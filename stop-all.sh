#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Stopping all services...${NC}"

# Function to kill process on a port
kill_port() {
    echo -e "${YELLOW}Killing process on port $1...${NC}"
    sudo kill -9 $(lsof -t -i:$1) 2>/dev/null || true
}

# Kill processes on specific ports
kill_port 3000
kill_port 7000
kill_port 8080

# Kill processes from PID file if it exists
if [ -f ~/.service_pids ]; then
    echo -e "${BLUE}Stopping processes from PID file...${NC}"
    source ~/.service_pids
    
    if [ ! -z "$NEXT_PID" ]; then
        echo -e "${YELLOW}Stopping Next.js (PID: $NEXT_PID)...${NC}"
        kill -9 $NEXT_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRPC_PID" ]; then
        echo -e "${YELLOW}Stopping FRP client (PID: $FRPC_PID)...${NC}"
        kill -9 $FRPC_PID 2>/dev/null || true
    fi
    
    # Remove the PID file
    rm ~/.service_pids
fi

# Double check if any processes are still running on our ports
for port in 3000 7000 8080; do
    if lsof -i :$port > /dev/null; then
        echo -e "${RED}Warning: Process still running on port $port${NC}"
        echo -e "${YELLOW}Please check manually: lsof -i :$port${NC}"
    fi
done

echo -e "${GREEN}All services stopped!${NC}" 