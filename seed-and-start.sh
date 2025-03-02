#!/bin/bash

# Set error handling
set -e

echo "=== Bradán Accountants Platform: Seed and Start ==="
echo "This script will seed the database and start the application"
echo "------------------------------------------------------"

# Kill any existing processes on ports 3000 and 5173
echo "Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Kill any remaining node processes related to our app
pkill -f "node.*api/server.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Start backend server with seeding
echo "Setting up backend..."
cd api
echo "Installing backend dependencies..."
npm install --legacy-peer-deps

echo "Generating Prisma client..."
npx prisma generate

echo "Pushing database schema..."
npx prisma db push

echo "Seeding database..."
npx prisma db seed

echo "Starting backend server..."
npm run dev &

# Wait for backend to start
echo "Waiting for backend to initialize..."
sleep 5

# Start frontend server
echo "Setting up frontend..."
cd ../app
echo "Installing frontend dependencies..."
npm install --legacy-peer-deps

echo "Starting frontend server..."
npm run dev &

echo "------------------------------------------------------"
echo "✅ All services started successfully!"
echo "   - Backend API running on http://localhost:3000"
echo "   - Frontend running on http://localhost:5173"
echo "------------------------------------------------------"
echo "Press Ctrl+C to stop all servers."
wait
