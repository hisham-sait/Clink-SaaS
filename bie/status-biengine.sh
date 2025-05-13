#!/bin/bash

# Check the status of BI Engine (Apache Superset) Docker containers
BIE_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BIE_HOME"

echo "📊 BI Engine Status Check"
echo "========================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if the containers are running
echo "🔍 Checking container status..."
docker-compose ps

# Check if the web application is accessible
echo -e "\n🌐 Checking web application..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8089/health | grep -q "200"; then
    echo "✅ BI Engine web application is running and accessible at http://localhost:8089"
else
    echo "❌ BI Engine web application is not accessible at http://localhost:8089"
fi

# Show resource usage
echo -e "\n💻 Container resource usage:"
docker stats --no-stream $(docker-compose ps -q)

echo -e "\n💡 Commands:"
echo "  - Start BI Engine:  ./start-biengine.sh"
echo "  - Stop BI Engine:   ./stop-biengine.sh"
echo "  - View logs:        docker-compose logs"
