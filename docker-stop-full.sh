#!/bin/bash

# Script to stop the full Docker setup including auth service for Clink SaaS

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

print_section "Stopping Full Docker Setup (with Auth)"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop the containers using the full docker-compose file
print_warning "Stopping all containers including auth service..."
docker-compose -f docker-compose-full.yml down

if [ $? -eq 0 ]; then
    print_success "All containers stopped successfully."
else
    print_error "Failed to stop containers."
    exit 1
fi

print_section "Container Status"
docker-compose -f docker-compose-full.yml ps

print_warning "To start the full setup again, run './docker-start-full.sh'."
