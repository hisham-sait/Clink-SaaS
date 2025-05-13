# Authelia SSO Setup for Clink-SaaS

This directory contains the configuration for Authelia, a Single Sign-On (SSO) solution that can be used to secure your Clink-SaaS application.

## Quick Start

1. Start Authelia:
   ```bash
   ./start-authelia.sh
   ```

2. Access the Authelia portal:
   http://127.0.0.1:9091

3. Default credentials:
   - Username: testuser
   - Password: password

4. Stop Authelia:
   ```bash
   ./stop-authelia.sh
   ```

5. Check Authelia status:
   ```bash
   ./status-authelia.sh
   ```

## Configuration

The main configuration files are located in the `config` directory:

- `configuration.yml`: Main Authelia configuration
- `users_database.yml`: User credentials and settings

## Integration with Your Application

### 1. API Integration

To integrate Authelia with your API, you'll need to modify the `api/middleware/auth.js` file to validate Authelia's JWT tokens.

Example integration:

```javascript
// In api/middleware/auth.js
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

// Authelia JWT verification
const verifyAutheliaToken = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.AUTHELIA_JWT_SECRET);
    
    // Add user info to request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      groups: decoded.groups
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = {
  verifyAutheliaToken
};
```

### 2. Frontend Integration

For frontend integration, you'll need to:

1. Redirect unauthenticated users to Authelia
2. Handle the callback from Authelia
3. Store and use the JWT token for API requests

Example React integration:

```javascript
// In app/src/services/auth.js
export const login = () => {
  // Redirect to Authelia
  window.location.href = 'http://127.0.0.1:9091?rd=' + encodeURIComponent(window.location.origin + '/callback');
};

export const handleCallback = async () => {
  // Get token from URL or cookie set by Authelia
  const token = getTokenFromUrlOrCookie();
  
  if (token) {
    // Store token
    localStorage.setItem('auth_token', token);
    
    // Redirect to app
    window.location.href = '/dashboard';
  } else {
    // Handle error
    window.location.href = '/login?error=auth_failed';
  }
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    Authorization: `Bearer ${token}`
  };
};
```

### 3. Reverse Proxy Configuration

For production, you should use a reverse proxy (like Nginx or Traefik) to handle the authentication flow. The proxy should be configured to:

1. Forward authentication requests to Authelia
2. Protect your application routes based on Authelia's response
3. Handle redirects and cookies properly

## Production Considerations

Before deploying to production:

1. Replace the JWT secret in `configuration.yml`
2. Configure proper SMTP settings for email notifications
3. Consider using a more robust authentication backend (LDAP, etc.)
4. Set up HTTPS for all services
5. Configure proper access control rules for your domains
6. Consider using a database backend instead of SQLite for storage

## Additional Resources

- [Authelia Documentation](https://www.authelia.com/docs/)
- [Authelia GitHub Repository](https://github.com/authelia/authelia)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
