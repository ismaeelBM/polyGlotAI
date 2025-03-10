import axios from 'axios';

// Backend server URL - make sure this matches your server
// For local development with a separate backend server, use port 3000
// For local development with React dev server (which runs on 3000 by default),
// the backend server should run on a different port, like 3001
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

// Helper functions for API calls
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
  },
  
  /**
   * Get user vocabulary items
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of vocabulary items
   */
  getVocabulary: async (userId) => {
    try {
      const response = await apiClient.get(`/api/users/${userId}/vocabulary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      // For demo, fallback to empty array if API fails
      return [];
    }
  },
  
  /**
   * Add new vocabulary items
   * @param {string} userId - User ID
   * @param {Array} items - Array of vocabulary items to add
   * @returns {Promise<Array>} - Updated array of vocabulary items
   */
  addVocabularyItems: async (userId, items) => {
    try {
      const response = await apiClient.post(`/api/users/${userId}/vocabulary`, { items });
      return response.data;
    } catch (error) {
      console.error('Error adding vocabulary items:', error);
      // Return the items that were supposed to be added
      return items;
    }
  },
  
  /**
   * Update user progress
   * @param {string} userId - User ID
   * @param {Object} progressData - Progress data to update
   * @returns {Promise<Object>} - Updated progress data
   */
  updateProgress: async (userId, progressData) => {
    try {
      const response = await apiClient.post(`/api/users/${userId}/progress`, progressData);
      return response.data;
    } catch (error) {
      console.error('Error updating progress:', error);
      // Return the progress data that was supposed to be updated
      return progressData;
    }
  },
  
  /**
   * Validate a subscription upgrade
   * @param {string} userId - User ID
   * @param {string} planId - Plan ID to upgrade to
   * @returns {Promise<Object>} - Subscription details
   */
  upgradeSubscription: async (userId, planId) => {
    try {
      const response = await apiClient.post(`/api/users/${userId}/subscription`, { planId });
      return response.data;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      throw error;
    }
  }
};

export default api; 