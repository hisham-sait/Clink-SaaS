#!/bin/bash

# Text colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to display error and exit
error_exit() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

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
    cd $dir || error_exit "Could not change to directory $dir"
    npm install || error_exit "Failed to install dependencies in $dir"
    cd - > /dev/null
}

# Install dependencies
install_dependencies "api"
install_dependencies "app"

# Function to start a process in a new terminal
start_process() {
    local name=$1
    local dir=$2
    local command=$3
    
    echo -e "${YELLOW}Starting $name...${NC}"
    
    # Check if running on macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS - use osascript to open new terminal
        osascript -e "tell app \"Terminal\" to do script \"cd $(pwd)/$dir && $command\""
    # Check if running on Linux with GNOME Terminal
    elif command_exists "gnome-terminal"; then
        gnome-terminal -- bash -c "cd $(pwd)/$dir && $command; exec bash"
    # Check if running on Windows with Git Bash
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        start bash -c "cd $(pwd)/$dir && $command"
    else
        # Fallback - run in background
        cd $dir
        $command &
        cd - > /dev/null
    fi
}

# Start API server
start_process "API Server" "api" "npm run dev"

# Wait a moment for API to initialize
echo -e "${YELLOW}Waiting for API to initialize...${NC}"
sleep 3

# Start Angular development server
start_process "Angular Development Server" "app" "ng serve"

echo -e "${GREEN}Startup complete!${NC}"
echo -e "${YELLOW}API server running on http://localhost:3000${NC}"
echo -e "${YELLOW}Angular app running on http://localhost:4200${NC}"
echo -e "\nPress Ctrl+C to stop all servers"

# Keep script running to allow Ctrl+C to work
wait
