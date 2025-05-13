#!/bin/bash

# Script to generate self-signed SSL certificates for testing
# DO NOT use these certificates in production!

# Navigate to the script directory
cd "$(dirname "$0")"

# Create SSL directory if it doesn't exist
mkdir -p nginx/ssl

# Generate root CA
echo "Generating root CA..."
openssl genrsa -out nginx/ssl/rootCA.key 4096
openssl req -x509 -new -nodes -key nginx/ssl/rootCA.key -sha256 -days 1024 -out nginx/ssl/rootCA.crt -subj "/C=US/ST=State/L=City/O=Organization/OU=IT/CN=Clink-SaaS-CA"

# Function to generate certificate for a domain
generate_cert() {
  local domain=$1
  echo "Generating certificate for $domain..."
  
  # Generate key
  openssl genrsa -out nginx/ssl/$domain.key 2048
  
  # Create config file
  cat > nginx/ssl/$domain.conf <<EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = req_ext

[dn]
C=US
ST=State
L=City
O=Clink-SaaS
OU=IT
CN=$domain

[req_ext]
subjectAltName = @alt_names

[alt_names]
DNS.1 = $domain
DNS.2 = www.$domain
EOF
  
  # Generate CSR
  openssl req -new -key nginx/ssl/$domain.key -out nginx/ssl/$domain.csr -config nginx/ssl/$domain.conf
  
  # Generate certificate
  openssl x509 -req -in nginx/ssl/$domain.csr -CA nginx/ssl/rootCA.crt -CAkey nginx/ssl/rootCA.key -CAcreateserial -out nginx/ssl/$domain.crt -days 365 -sha256 -extensions req_ext -extfile nginx/ssl/$domain.conf
  
  # Clean up
  rm nginx/ssl/$domain.csr nginx/ssl/$domain.conf
  
  echo "Certificate for $domain generated successfully."
}

# Generate certificates for domains
generate_cert "example.com"
generate_cert "api.example.com"
generate_cert "auth.example.com"

echo "All certificates generated successfully."
echo ""
echo "To use these certificates for testing:"
echo "1. Add the rootCA.crt to your browser's trusted certificates"
echo "2. Update your hosts file to point the domains to 127.0.0.1"
echo "   127.0.0.1 example.com www.example.com api.example.com auth.example.com"
echo ""
echo "WARNING: These are self-signed certificates for testing only."
echo "DO NOT use these certificates in production!"
