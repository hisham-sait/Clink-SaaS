#!/bin/bash

# Kill any existing processes on ports 3000 and 5173
echo "Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Start backend server
echo "Setting up backend..."
cd api
npm install --legacy-peer-deps
npx prisma generate
npx prisma db push
echo "Starting backend server..."
npm run dev &

# Wait for backend to start
echo "Waiting for backend to initialize..."
sleep 5

# Start frontend server
echo "Setting up frontend..."
cd ../app
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
echo "Starting frontend server..."
npm run dev &

# Keep script running
echo "All services started. Press Ctrl+C to stop all servers."
wait
