import axios from 'axios';
import { isTokenExpired } from './tokenUtils';  

// Create an Axios instance to use throughout the app
const api = axios.create({
  baseURL: 'http://localhost:5000',  // for pc run only
  // baseURL: 'http://192.168.236.30:5000',  // to test on mobile
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for response to handle token expiry and 401 errors
api.interceptors.response.use(
  (response) => response, // If the response is successful, just return it
  (error) => {
    // Check if the error response status is 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error);  // Reject the error to propagate it
  }
);

// Optionally: You can add a request interceptor if needed for authorization headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !isTokenExpired()) {
      // If token exists and is not expired, add it to the Authorization header
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
