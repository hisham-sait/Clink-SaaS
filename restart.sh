#!/bin/bash

echo "Stopping all running processes..."

# Function to kill process on a port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null
    fi
}

# Kill processes on commonly used ports
kill_port 3000  # Backend API
kill_port 5173  # Vite dev server

# Kill any remaining node processes related to our app
pkill -f "node.*api/server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null

echo "Cleaning up node_modules..."
rm -rf api/node_modules api/package-lock.json
rm -rf app-react/node_modules app-react/package-lock.json

echo "Installing backend dependencies..."
cd api
npm install express cors dotenv jsonwebtoken bcryptjs nodemon @prisma/client
npm install --save-dev prisma
npx prisma generate
npx prisma db push
npx prisma db seed

echo "Installing frontend dependencies..."
cd ../app-react
npm install
npm install -g vite

echo "Starting backend server..."
cd ../api
npm run dev &
sleep 5  # Wait for backend to start

echo "Starting frontend server..."
cd ../app-react
npm run dev &

echo "All services started. Press Ctrl+C to stop all servers."
wait
