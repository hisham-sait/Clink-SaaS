#!/bin/bash

# Simple restart script for Clink SaaS multi-tenant application

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

print_section "Stopping Application"
# Kill any existing processes on ports 3000, 5173, and 8088
echo "Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
lsof -ti:8088 | xargs kill -9 2>/dev/null
print_success "Existing processes stopped"

print_section "Restarting Application"
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

# Start Apache Superset dashboard
echo "Starting Apache Superset dashboard..."
cd ../dash
# Check if Superset is already set up
if [ ! -f "superset.db" ]; then
    echo "Superset is not set up yet. Running setup script..."
    ./scripts/setup_superset.sh
fi
./scripts/start_superset.sh &
print_success "Apache Superset dashboard started"

# Keep script running
print_section "Application Restarted"
echo "All services restarted successfully. Press Ctrl+C to stop all servers."
echo "Access the services at:"
echo "  - Backend API: http://localhost:3000"
echo "  - Frontend: http://localhost:5173"
echo "  - Apache Superset: http://localhost:8088 (admin/admin)"
wait
