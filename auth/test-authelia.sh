#!/bin/bash

# Test script for Authelia
# This script helps verify that Authelia is working correctly

# Navigate to the auth directory
cd "$(dirname "$0")"

# Check if Authelia is running
echo "Checking if Authelia is running..."
AUTHELIA_RUNNING=$(docker-compose ps -q authelia)

if [ -z "$AUTHELIA_RUNNING" ]; then
  echo "Authelia is not running. Starting Authelia..."
  ./start-authelia.sh
  
  # Wait for Authelia to start
  echo "Waiting for Authelia to start..."
  sleep 5
fi

# Test Authelia API
echo "Testing Authelia API..."
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:9091/api/state | grep -q "200" && {
  echo "✅ Authelia API is responding"
} || {
  echo "❌ Authelia API is not responding"
  echo "Check the logs with: docker-compose logs authelia"
  exit 1
}

# Open Authelia in the browser
echo "Opening Authelia in the browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  open http://127.0.0.1:9091
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  xdg-open http://127.0.0.1:9091
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  # Windows
  start http://127.0.0.1:9091
else
  echo "Please open http://127.0.0.1:9091 in your browser"
fi

echo ""
echo "Test login with:"
echo "Username: testuser"
echo "Password: password"
echo ""
echo "If you can log in successfully, Authelia is working correctly!"
echo "You can now integrate it with your application."
