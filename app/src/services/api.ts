import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  timeout: 60000, // 60 seconds timeout
});

// Add a request interceptor to add the auth token, company ID, and handle multipart/form-data
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (user?.companyId) {
      config.headers['X-Company-ID'] = user.companyId;
    }

    // Handle FormData
    if (config.data instanceof FormData) {
      // Remove Content-Type header to let the browser set it with boundary
      delete config.headers['Content-Type'];
      
      // Log FormData contents for debugging
      console.log('FormData contents:');
      for (const pair of config.data.entries()) {
        if (pair[0] === 'file') {
          const file = pair[1] as File;
          console.log('File:', {
            name: file.name,
            type: file.type,
            size: file.size
          });
        } else {
          console.log(`${pair[0]}:`, pair[1]);
        }
      }
    }

    // Log request details
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      headers: config.headers,
      data: config.data instanceof FormData ? 'FormData' : config.data
    });

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);

      // Handle token expiration
      if (error.response.status === 401 && error.response.data?.message === 'Token expired') {
        // Clear token and user data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
        return Promise.reject(new Error('Session expired. Please login again.'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
