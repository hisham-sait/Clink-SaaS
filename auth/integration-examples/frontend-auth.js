/**
 * Example integration of Authelia with the React frontend
 * This file shows how to integrate Authelia SSO with the frontend application
 */

// Auth service for Authelia integration
export const AuthService = {
  // Redirect to Authelia login
  login: () => {
    // Get the current URL to redirect back after authentication
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
    
    // Redirect to Authelia
    window.location.href = `${process.env.REACT_APP_AUTHELIA_URL}?rd=${redirectUri}`;
  },
  
  // Handle the callback from Authelia
  handleCallback: () => {
    return new Promise((resolve, reject) => {
      try {
        // Get the JWT token from the URL or cookies
        // Authelia can be configured to return the token in different ways
        
        // Option 1: Get token from URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('jwt');
        
        // Option 2: Get token from cookies (if Authelia is configured to set cookies)
        // const token = getCookieValue('authelia_jwt');
        
        if (!token) {
          throw new Error('No token received from Authelia');
        }
        
        // Store the token
        localStorage.setItem('auth_token', token);
        
        // Decode the token to get user info (without verification)
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid token format');
        }
        
        const payload = JSON.parse(atob(tokenParts[1]));
        
        // Store user info
        const user = {
          email: payload.email,
          username: payload.sub,
          groups: payload.groups || [],
          // Add any other user info from the token
        };
        
        localStorage.setItem('user_info', JSON.stringify(user));
        
        // Resolve with the user info
        resolve(user);
        
        // Redirect to the app
        window.location.href = '/dashboard';
      } catch (error) {
        console.error('Error handling Authelia callback:', error);
        reject(error);
        
        // Redirect to login page with error
        window.location.href = '/login?error=auth_failed';
      }
    });
  },
  
  // Check if the user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return false;
    }
    
    // Check if token is expired
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        return false;
      }
      
      const payload = JSON.parse(atob(tokenParts[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      
      return Date.now() < expiryTime;
    } catch (error) {
      console.error('Error checking token:', error);
      return false;
    }
  },
  
  // Get the authentication token
  getToken: () => {
    return localStorage.getItem('auth_token');
  },
  
  // Get the user info
  getUserInfo: () => {
    const userInfoStr = localStorage.getItem('user_info');
    if (!userInfoStr) {
      return null;
    }
    
    try {
      return JSON.parse(userInfoStr);
    } catch (error) {
      console.error('Error parsing user info:', error);
      return null;
    }
  },
  
  // Logout
  logout: () => {
    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    
    // Redirect to Authelia logout URL
    window.location.href = `${process.env.REACT_APP_AUTHELIA_URL}/logout`;
  },
  
  // Get auth headers for API requests
  getAuthHeaders: () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return {};
    }
    
    return {
      'Authorization': `Bearer ${token}`
    };
  }
};

// Example React component for login
export const LoginButton = () => {
  const handleLogin = () => {
    AuthService.login();
  };
  
  return (
    <button onClick={handleLogin}>
      Login with SSO
    </button>
  );
};

// Example React component for logout
export const LogoutButton = () => {
  const handleLogout = () => {
    AuthService.logout();
  };
  
  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
};

// Example React component for protected routes
export const ProtectedRoute = ({ children }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  
  if (!isAuthenticated) {
    // Redirect to login
    AuthService.login();
    return null;
  }
  
  return children;
};

// Example API service that uses the auth token
export const ApiService = {
  get: async (url) => {
    const headers = {
      ...AuthService.getAuthHeaders(),
      'Content-Type': 'application/json'
    };
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        // Token might be expired, redirect to login
        AuthService.login();
        throw new Error('Unauthorized');
      }
      
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },
  
  post: async (url, data) => {
    const headers = {
      ...AuthService.getAuthHeaders(),
      'Content-Type': 'application/json'
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        // Token might be expired, redirect to login
        AuthService.login();
        throw new Error('Unauthorized');
      }
      
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  }
  
  // Add other methods as needed (PUT, DELETE, etc.)
};

// Example callback component
export const AuthCallback = () => {
  useEffect(() => {
    // Handle the callback when the component mounts
    AuthService.handleCallback()
      .catch(error => {
        console.error('Error in callback:', error);
      });
  }, []);
  
  return (
    <div>
      <h2>Authenticating...</h2>
      <p>Please wait while we complete the authentication process.</p>
    </div>
  );
};
