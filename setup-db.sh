#!/bin/bash

# Create PostgreSQL database for Clink SaaS
echo "Creating PostgreSQL database 'clink_saas'..."

# Set PostgreSQL credentials
DB_NAME="clink_saas"

# Create database
createdb $DB_NAME 2>/dev/null || echo "Database already exists or could not be created."
echo "Database '$DB_NAME' created successfully."

# Navigate to API directory
cd api

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate dev --name init

# Seed the database
echo "Seeding the database..."
npx prisma db seed

echo "Database setup completed successfully!"
