#!/bin/bash

# Simple start script for Clink SaaS multi-tenant application

# Color codes for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Kill any existing processes on ports 3000 and 5173
print_section "Starting Application"
echo "Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Start backend server
echo "Starting backend server..."
cd api
npm run dev &
print_success "Backend server started"

# Wait for backend to start
sleep 3

# Start frontend server
echo "Starting frontend server..."
cd ../app
npm run dev &
print_success "Frontend server started"

# Keep script running
print_section "Application Started"
echo "All services started successfully. Press Ctrl+C to stop all servers."
wait
