#!/bin/bash

# Text colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Store PIDs for cleanup
API_PID=""
ANGULAR_PID=""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to display error and exit
error_exit() {
    echo -e "${RED}Error: $1${NC}" >&2
    cleanup
    exit 1
}

# Function to check if a port is in use
is_port_in_use() {
    local port=$1
    if command_exists "lsof"; then
        lsof -i:"$port" >/dev/null 2>&1
        return $?
    elif command_exists "netstat"; then
        netstat -an | grep "LISTEN" | grep -q ":$port "
        return $?
    fi
    return 1
}

# Function to safely kill process on a port
kill_process_on_port() {
    local port=$1
    echo -e "${YELLOW}Checking for process on port $port...${NC}"
    
    if command_exists "lsof"; then
        local pid=$(lsof -ti:"$port" 2>/dev/null)
        if [ ! -z "$pid" ]; then
            echo -e "${YELLOW}Stopping process on port $port (PID: $pid)...${NC}"
            kill -15 "$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null
            sleep 2
        fi
    elif command_exists "netstat" && [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        # Windows-specific implementation
        local pid=$(netstat -ano | grep ":$port" | grep "LISTENING" | awk '{print $5}')
        if [ ! -z "$pid" ]; then
            echo -e "${YELLOW}Stopping process on port $port (PID: $pid)...${NC}"
            taskkill //F //PID "$pid" >/dev/null 2>&1
            sleep 2
        fi
    elif command_exists "netstat"; then
        # Unix netstat implementation
        local pid=$(netstat -nlp 2>/dev/null | grep ":$port" | awk '{print $7}' | cut -d'/' -f1)
        if [ ! -z "$pid" ]; then
            echo -e "${YELLOW}Stopping process on port $port (PID: $pid)...${NC}"
            kill -15 "$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null
            sleep 2
        fi
    fi
}

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Cleaning up...${NC}"
    
    # Kill Angular process
    if [ ! -z "$ANGULAR_PID" ]; then
        kill -15 "$ANGULAR_PID" 2>/dev/null || kill -9 "$ANGULAR_PID" 2>/dev/null
    fi
    
    # Kill API process
    if [ ! -z "$API_PID" ]; then
        kill -15 "$API_PID" 2>/dev/null || kill -9 "$API_PID" 2>/dev/null
    fi
    
    # Additional cleanup for any remaining processes
    kill_process_on_port 3000
    kill_process_on_port 4200
    
    echo -e "${GREEN}Cleanup complete${NC}"
}

# Set up trap for cleanup on script termination
trap cleanup EXIT INT TERM

# Check for required commands
echo -e "${YELLOW}Checking prerequisites...${NC}"
command_exists "node" || error_exit "Node.js is not installed"
command_exists "npm" || error_exit "npm is not installed"

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
if [ "$(printf '%s\n' "14.0.0" "$NODE_VERSION" | sort -V | head -n1)" = "14.0.0" ]; then
    echo -e "${GREEN}Node.js version $NODE_VERSION - OK${NC}"
else
    error_exit "Node.js version must be 14.0.0 or higher (current: $NODE_VERSION)"
fi

# Function to install dependencies
install_dependencies() {
    local dir=$1
    echo -e "${YELLOW}Installing dependencies in $dir...${NC}"
    cd "$dir" || error_exit "Could not change to directory $dir"
    npm install || error_exit "Failed to install dependencies in $dir"
    cd - > /dev/null
}

# Install dependencies
install_dependencies "api"
install_dependencies "app"

# Kill any existing processes on ports
kill_process_on_port 3000
kill_process_on_port 4200

# Start API server
cd api || error_exit "Could not change to api directory"
echo -e "${YELLOW}Starting API Server...${NC}"
node server.js &
API_PID=$!
cd ..

# Wait for API to be ready
echo -e "${YELLOW}Waiting for API to initialize...${NC}"
sleep 5

# Check if API started successfully
if ! kill -0 $API_PID 2>/dev/null; then
    error_exit "API server failed to start"
fi

# Verify API port is now in use
if ! is_port_in_use 3000; then
    error_exit "API server is not listening on port 3000"
fi

# Start Angular development server
cd app || error_exit "Could not change to app directory"
echo -e "${YELLOW}Starting Angular Development Server...${NC}"
ng serve --port 4200 &
ANGULAR_PID=$!
cd ..

# Wait for Angular to be ready
echo -e "${YELLOW}Waiting for Angular to initialize...${NC}"
sleep 10

# Check if Angular started successfully
if ! kill -0 $ANGULAR_PID 2>/dev/null; then
    error_exit "Angular server failed to start"
fi

# Verify Angular port is now in use
if ! is_port_in_use 4200; then
    error_exit "Angular server is not listening on port 4200"
fi

echo -e "${GREEN}Startup complete!${NC}"
echo -e "${YELLOW}API server running on http://localhost:3000${NC}"
echo -e "${YELLOW}Angular app running on http://localhost:4200${NC}"
echo -e "\nPress Ctrl+C to stop all servers"

# Wait for both processes
wait $API_PID $ANGULAR_PID
