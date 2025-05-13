#!/bin/bash

# Script to check the status of Docker containers for Clink SaaS

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

print_section "Checking Docker Container Status"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if any containers are running
if ! docker ps | grep -q "clink-"; then
    print_warning "No Clink SaaS containers are currently running."
    print_warning "Run './docker-start.sh' or './docker-start-full.sh' to start the application."
    exit 0
fi

# Check basic setup containers
print_section "Basic Setup Containers"
echo "Container Name          Status          Ports"
echo "----------------------------------------------"

# Check DB
if docker ps | grep -q "clink-db"; then
    print_success "clink-db              Running         5432:5432"
else
    print_error "clink-db              Not running"
fi

# Check Redis
if docker ps | grep -q "clink-redis"; then
    print_success "clink-redis           Running         6379:6379"
else
    print_error "clink-redis           Not running"
fi

# Check API
if docker ps | grep -q "clink-api"; then
    print_success "clink-api             Running         3000:3000"
else
    print_error "clink-api             Not running"
fi

# Check App
if docker ps | grep -q "clink-app"; then
    print_success "clink-app             Running         80:80"
else
    print_error "clink-app             Not running"
fi

# Check auth services
print_section "Authentication Services (Full Setup Only)"
echo "Container Name          Status          Ports"
echo "----------------------------------------------"

# Check Authelia
if docker ps | grep -q "clink-authelia"; then
    print_success "clink-authelia        Running         9091:9091"
else
    print_warning "clink-authelia        Not running     (Only in full setup)"
fi

# Check Nginx
if docker ps | grep -q "clink-nginx"; then
    print_success "clink-nginx           Running         443:443"
else
    print_warning "clink-nginx           Not running     (Only in full setup)"
fi

print_section "Container Resource Usage"
docker stats --no-stream $(docker ps --format "{{.Names}}" | grep "clink-")

print_section "Available Commands"
echo "- Start basic setup:    ./docker-start.sh"
echo "- Start full setup:     ./docker-start-full.sh"
echo "- Stop basic setup:     ./docker-stop.sh"
echo "- Stop full setup:      ./docker-stop-full.sh"
echo "- Initialize database:  ./docker-init-db.sh"
