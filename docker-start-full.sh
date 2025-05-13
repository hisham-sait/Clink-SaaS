#!/bin/bash

# Script to start the full Docker setup including auth service for Clink SaaS

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

print_section "Starting Full Docker Setup (with Auth)"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start the containers using the full docker-compose file
print_warning "Starting all containers including auth service..."
docker-compose -f docker-compose-full.yml up -d

if [ $? -eq 0 ]; then
    print_success "All containers started successfully."
else
    print_error "Failed to start containers."
    exit 1
fi

print_section "Container Status"
docker-compose -f docker-compose-full.yml ps

print_section "Application URLs"
echo "Access the services at:"
echo "  - Frontend: http://localhost"
echo "  - Backend API: http://localhost:3000"
echo "  - Authelia: http://localhost:9091"
echo "  - Secure access (via Nginx): https://localhost"

print_warning "If this is the first time running the application, you may need to initialize the database."
print_warning "Run './docker-init-db.sh' to set up the database."
