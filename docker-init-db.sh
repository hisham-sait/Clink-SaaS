#!/bin/bash

# Script to initialize and migrate the database in Docker environment

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

print_section "Docker Database Initialization"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if the database container is running
if ! docker ps | grep -q clink-db; then
    print_warning "Database container is not running. Starting containers..."
    docker-compose up -d db
    
    # Wait for the database to be ready
    print_warning "Waiting for database to be ready..."
    sleep 10
fi

print_section "Running Prisma Migrations"

# Run Prisma migrations inside the API container
print_warning "Generating Prisma client..."
docker-compose exec api npx prisma generate
if [ $? -ne 0 ]; then
    print_error "Failed to generate Prisma client. Starting API container..."
    docker-compose up -d api
    sleep 5
    docker-compose exec api npx prisma generate
fi

print_warning "Running Prisma migrations..."
docker-compose exec api npx prisma migrate deploy
if [ $? -eq 0 ]; then
    print_success "Prisma migrations completed successfully."
else
    print_error "Failed to run Prisma migrations."
    exit 1
fi

print_section "Seeding Database"

# Seed the database
print_warning "Seeding the database..."
docker-compose exec api npx prisma db seed
if [ $? -eq 0 ]; then
    print_success "Database seeding completed successfully."
else
    print_error "Failed to seed the database."
    exit 1
fi

print_section "Database Initialization Complete"
print_success "The database has been successfully initialized and migrated."
print_success "You can now use the application with Docker."
