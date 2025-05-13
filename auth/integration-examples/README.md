# Authelia Integration Examples

This directory contains examples and templates for integrating Authelia with your application.

## Contents

### Backend Integration

- `auth-middleware.js`: Example of how to modify the API middleware to work with Authelia tokens.
  This shows how to validate Authelia JWT tokens and extract user information.

### Frontend Integration

- `frontend-auth.js`: Example React components and services for integrating with Authelia.
  Includes login/logout functionality, protected routes, and API service with token handling.

### Nginx Configuration

- `nginx-config.conf`: Example Nginx configuration for using Authelia as an authentication proxy.
  This file has been copied to `nginx/conf.d/default.conf` for use with the full Docker Compose setup.

- `app-nginx.conf`: Example Nginx configuration for the frontend application container.

### Docker Compose

- `docker-compose-full.yml`: Complete Docker Compose configuration for running Authelia, your application,
  and Nginx as a reverse proxy in a production-like environment.

### SSL Certificates

- `generate-test-certs.sh`: Script to generate self-signed SSL certificates for testing.
  These certificates are stored in the `nginx/ssl` directory.

## How to Use These Examples

1. Review the examples to understand how Authelia integrates with different parts of your application.

2. Adapt the examples to your specific needs and environment.

3. For a complete test environment:
   ```bash
   # Generate test certificates
   ./generate-test-certs.sh
   
   # Start the full environment
   docker-compose -f docker-compose-full.yml up -d
   ```

4. For production, make sure to:
   - Replace self-signed certificates with proper SSL certificates
   - Update domain names and URLs
   - Secure all secrets and credentials
   - Configure proper access control rules

## Additional Resources

- See the main README.md in the auth directory for more information on Authelia setup.
- Visit the [Authelia Documentation](https://www.authelia.com/docs/) for detailed configuration options.
