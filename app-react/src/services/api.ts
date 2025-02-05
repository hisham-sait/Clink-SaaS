import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  timeout: 60000, // 60 seconds timeout
});

// Add a request interceptor to add the auth token and handle multipart/form-data
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return Promise.reject(error);
  }
);

export default api;
