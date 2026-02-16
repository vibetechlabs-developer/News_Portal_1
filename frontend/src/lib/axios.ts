import axios from 'axios';
import { getBaseUrl } from './api';

// Get base URL from environment or use empty string for relative URLs (Vite proxy)
const baseURL = getBaseUrl() || '';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: baseURL ? `${baseURL}/api/v1` : '/api/v1',
});

// Token storage key (same as AuthContext uses)
const STORAGE_KEY = 'news_portal_auth';

// Helper function to get auth token from localStorage
function getAuthToken(): string | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.access || null;
  } catch {
    return null;
  }
}

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
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
    // Handle common errors
    if (error.response?.status === 401) {
      // Token expired or invalid - could trigger logout here if needed
      console.warn('Unauthorized request - token may be invalid');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
