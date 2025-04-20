#!/bin/bash

# Simple start script for Clink SaaS multi-tenant application

# Color codes for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}! $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Kill any existing processes on ports 3000, 5173, and 8088
print_section "Starting Application"
echo "Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
lsof -ti:8088 | xargs kill -9 2>/dev/null

# Check if PostgreSQL is running
echo "Checking PostgreSQL status..."
if pg_isready > /dev/null 2>&1; then
    print_success "PostgreSQL is already running"
else
    echo "Starting PostgreSQL..."
    ./start-postgres.sh
    if [ $? -ne 0 ]; then
        print_error "Failed to start PostgreSQL. Please check the error messages above."
        exit 1
    fi
    print_success "PostgreSQL started"
fi

# Check if Redis is running
echo "Checking Redis status..."
if command -v redis-cli &> /dev/null && redis-cli ping > /dev/null 2>&1; then
    print_success "Redis is already running"
else
    print_warning "Redis may not be running. Apache Superset requires Redis for caching and async tasks."
    print_warning "If you encounter issues with Superset, please ensure Redis is installed and running."
    
    # Try to start Redis if it's installed
    if command -v redis-cli &> /dev/null; then
        echo "Attempting to start Redis..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            brew services start redis && print_success "Redis started" || print_warning "Failed to start Redis. Please start it manually."
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            sudo systemctl start redis && print_success "Redis started" || print_warning "Failed to start Redis. Please start it manually."
        else
            print_warning "Unsupported OS. Please start Redis manually."
        fi
    else
        print_warning "Redis CLI not found. Please install Redis before using Apache Superset."
    fi
fi

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

# Make scripts executable
chmod +x scripts/install_dependencies.sh
chmod +x scripts/setup_superset.sh
chmod +x scripts/start_superset.sh
chmod +x start.sh

# Check if Superset is already set up
if [ ! -f "superset.db" ]; then
    echo "Superset is not set up yet. Running setup script..."
    ./scripts/setup_superset.sh
    if [ $? -ne 0 ]; then
        print_error "Superset setup failed. Please check the error messages above."
        print_warning "The application will continue without Superset."
    fi
fi

# Start Superset
./scripts/start_superset.sh &
if [ $? -eq 0 ]; then
    print_success "Apache Superset dashboard started"
else
    print_error "Failed to start Apache Superset. Please check the error messages above."
    print_warning "The application will continue without Superset."
fi

# Keep script running
print_section "Application Started"
echo "All services started successfully. Press Ctrl+C to stop all servers."
echo "Access the services at:"
echo "  - Backend API: http://localhost:3000"
echo "  - Frontend: http://localhost:5173"
echo "  - Apache Superset: http://localhost:8088 (admin/admin)"
wait
