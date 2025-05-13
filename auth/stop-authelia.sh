#!/bin/bash

# Navigate to the auth directory
cd "$(dirname "$0")"

echo "Stopping Authelia..."
docker-compose down

echo "Authelia has been stopped"
