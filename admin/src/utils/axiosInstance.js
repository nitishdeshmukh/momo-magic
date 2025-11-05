import axios from 'axios';
import { url } from '../assets/assets';

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: url,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to get token from localStorage
const getToken = () => {
  try {
    const raw = localStorage.getItem("mm_auth_user");
    const userObj = raw ? JSON.parse(raw) : null;
    return userObj?.token || null;
  } catch {
    return null;
  }
};

// Request interceptor to add JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - could trigger logout here
      console.error('Unauthorized - token may be invalid');
      // Optionally clear localStorage and redirect to login
      localStorage.removeItem("mm_auth_user");
      window.location.href = '/'; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
