#!/bin/bash

# Navigate to the auth directory
cd "$(dirname "$0")"

echo "Checking Authelia status..."
docker-compose ps

echo ""
echo "To check logs, run: docker-compose logs -f authelia"
