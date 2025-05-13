#!/bin/bash

# Navigate to the auth directory
cd "$(dirname "$0")"

echo "Starting Authelia..."
docker-compose up -d

echo "Authelia is now running on port 9091"
echo "You can access the login page at: http://127.0.0.1:9091"
echo "Default credentials: testuser / password"
