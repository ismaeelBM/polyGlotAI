import axios from 'axios';

// Backend server URL - get from environment variable or default
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for call creation
});

// Add a request interceptor to inject auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API helper with only the essential functions
export const api = {
  /**
   * Create a new Ultravox call
   * @param {Object} callConfig - Configuration for the call
   * @returns {Promise<Object>} - Call data including join URL
   */
  createCall: async (callConfig) => {
    try {
      console.log('Sending request to create call:', callConfig);
      const response = await apiClient.post('/api/ultravox/calls', callConfig);
      console.log('Call created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating call:', error);
      throw error;
    }
  }
};

export default api; 