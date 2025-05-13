#!/bin/bash

# Stop BI Engine (Apache Superset) Docker containers
BIE_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BIE_HOME"

echo "🛑 Stopping BI Engine (Apache Superset) containers..."

# Stop the containers
docker-compose down

echo "✅ BI Engine containers have been stopped."
echo "💡 To start BI Engine again, run: ./start-biengine.sh"
