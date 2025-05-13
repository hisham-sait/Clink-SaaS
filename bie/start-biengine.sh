#!/bin/bash

# Start BI Engine (Apache Superset) Docker containers
BIE_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BIE_HOME"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if port 8089 is already in use
if lsof -Pi :8089 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Error: Port 8089 is already in use."
    echo "You can:"
    echo "  1. Stop the process using port 8089"
    echo "  2. Modify the port in docker-compose.yml"
    exit 1
fi

echo "🚀 Starting BI Engine (Apache Superset) containers..."

# Start the containers
docker-compose up -d

# Wait for the containers to be ready
echo "⏳ Waiting for containers to be ready..."
sleep 20

# Check if the containers are running
if docker-compose ps | grep -q "bie_app" && docker-compose ps | grep -q "bie_worker"; then
    echo "✅ BI Engine containers are running!"
    echo "🌐 Access BI Engine at: http://localhost:8089"
    echo "🔐 Admin credentials: admin / admin"
    echo "💡 To stop BI Engine, run: ./stop-biengine.sh"
else
    echo "❌ Error: Failed to start BI Engine containers."
    echo "Check the logs with: docker-compose logs"
    exit 1
fi
