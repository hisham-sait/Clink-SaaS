const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../../middleware/auth');

// Environment variables for dashboard configuration
const DASHBOARD_HOST = process.env.SUPERSET_HOST || 'http://localhost:8088';
const DASHBOARD_USERNAME = process.env.SUPERSET_USERNAME || 'admin';
const DASHBOARD_PASSWORD = process.env.SUPERSET_PASSWORD || 'admin';
const DASHBOARD_PROVIDER = process.env.SUPERSET_PROVIDER || 'db';

// Cache for the access token to avoid making too many requests
let accessTokenCache = {
  token: null,
  expiresAt: null
};

/**
 * Get an access token from the dashboard service
 */
async function getAccessToken() {
  // Check if we have a valid cached token
  if (accessTokenCache.token && accessTokenCache.expiresAt && accessTokenCache.expiresAt > Date.now()) {
    return accessTokenCache.token;
  }

  try {
    const response = await axios.post(`${DASHBOARD_HOST}/api/v1/security/login`, {
      username: DASHBOARD_USERNAME,
      password: DASHBOARD_PASSWORD,
      provider: DASHBOARD_PROVIDER,
      refresh: true
    });

    const { access_token, refresh_token } = response.data;
    
    // Cache the token with an expiration time (e.g., 1 hour)
    accessTokenCache = {
      token: access_token,
      expiresAt: Date.now() + 3600000 // 1 hour
    };
    
    return access_token;
  } catch (error) {
    console.error('Error getting dashboard access token:', error);
    throw new Error('Failed to authenticate with dashboard service');
  }
}

/**
 * Generate a guest token for embedding dashboards
 */
async function generateGuestToken(dashboardId, user) {
  try {
    console.log(`Attempting to generate guest token for dashboard ${dashboardId} and user ${user.email}`);
    
    const accessToken = await getAccessToken();
    console.log('Successfully obtained access token');
    
    const requestBody = {
      resources: [
        {
          type: 'dashboard',
          id: dashboardId
        }
      ],
      rls: [
        {
          clause: `company_id = ${user.companyId}`
        }
      ],
      user: {
        username: user.email,
        first_name: user.firstName || 'Guest',
        last_name: user.lastName || 'User'
      }
    };
    
    console.log('Guest token request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await axios.post(
      `${DASHBOARD_HOST}/api/v1/security/guest_token`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    
    console.log('Guest token response:', response.status, response.statusText);
    
    return response.data.token;
  } catch (error) {
    console.error('Error generating guest token:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw new Error(`Failed to generate dashboard access token: ${error.message}`);
  }
}

/**
 * API endpoint to get a guest token for a dashboard
 */
router.post('/guest-token', auth, async (req, res) => {
  const { dashboardId } = req.body;
  
  if (!dashboardId) {
    return res.status(400).json({ message: 'Dashboard ID is required' });
  }
  
  try {
    // For development, return a mock token
    if (process.env.NODE_ENV === 'development' && process.env.MOCK_SUPERSET_TOKEN === 'true') {
      return res.json({ token: 'mock-token-for-development' });
    }
    
    const token = await generateGuestToken(dashboardId, req.user);
    res.json({ token });
  } catch (error) {
    console.error('Error generating dashboard access token:', error);
    res.status(500).json({ 
      message: 'Unable to access dashboard service. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * API endpoint to get all available dashboards
 */
router.get('/dashboards', auth, async (req, res) => {
  try {
    // Get an access token
    const accessToken = await getAccessToken();
    
    // Fetch dashboards from Superset
    const response = await axios.get(
      `${DASHBOARD_HOST}/api/v1/dashboard/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    
    // Extract relevant dashboard information
    const dashboards = response.data.result.map(dashboard => ({
      id: dashboard.id.toString(),
      title: dashboard.dashboard_title,
      url: dashboard.url,
      status: dashboard.status
    }));
    
    res.json(dashboards);
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    res.status(500).json({ 
      message: 'Unable to fetch dashboards. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
