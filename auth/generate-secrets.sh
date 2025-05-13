#!/bin/bash

# Script to generate secure secrets for Authelia
# This script generates a JWT secret and other required secrets

# Navigate to the auth directory
cd "$(dirname "$0")"

# Check if .env file exists
if [ -f .env ]; then
  echo "Warning: .env file already exists. This will overwrite existing secrets."
  read -p "Continue? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 1
  fi
fi

# Generate JWT secret
echo "Generating JWT secret..."
JWT_SECRET=$(openssl rand -hex 32)

# Create or update .env file
echo "# Authelia Configuration - Generated on $(date)" > .env
echo "# WARNING: Keep this file secure and do not commit to version control" >> .env
echo "" >> .env
echo "# JWT Secret for Authelia (used to sign tokens)" >> .env
echo "AUTHELIA_JWT_SECRET=$JWT_SECRET" >> .env
echo "" >> .env

# Copy other settings from .env.example
echo "Copying other settings from .env.example..."
grep -v "AUTHELIA_JWT_SECRET" .env.example | grep -v "^#" | grep -v "^$" >> .env

echo "Secrets generated and saved to .env file."
echo "Make sure to update other settings in the .env file as needed."
echo ""
echo "To use these secrets, run:"
echo "export \$(grep -v '^#' .env | xargs)"
echo ""
echo "Remember to update your API service to use the same JWT secret:"
echo "AUTHELIA_JWT_SECRET=$JWT_SECRET"
