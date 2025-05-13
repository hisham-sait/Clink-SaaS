#!/bin/bash

# This script adds entries to the hosts file to map seegap.com domains to localhost
# Requires sudo privileges to modify the hosts file

echo "This script will add entries to your hosts file to map seegap.com domains to localhost."
echo "You will need to provide your password for sudo access."
echo ""

# Domains to add
DOMAINS=(
  "seegap.com"
  "auth.seegap.com"
  "app.seegap.com"
  "dash.seegap.com"
  "api.seegap.com"
)

# Check if entries already exist
for DOMAIN in "${DOMAINS[@]}"; do
  if grep -q "$DOMAIN" /etc/hosts; then
    echo "Entry for $DOMAIN already exists in /etc/hosts"
  else
    echo "Adding entry for $DOMAIN to /etc/hosts"
    echo "127.0.0.1 $DOMAIN" | sudo tee -a /etc/hosts
  fi
done

echo ""
echo "Hosts file updated. You can now access Authelia at http://seegap.com:9091"
echo "Default credentials: testuser / password"
