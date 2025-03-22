import axios from 'axios';

// Backend server URL - get from environment variable or default
const BACKEND_URL = 'http://localhost:6996';

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

// Map tool names to API endpoints
const toolEndpoints = {
  changeToTestingMode: '/api/tools/changeToTestingMode',
  endTestingMode: '/api/tools/endTestingMode'
};

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
  },

  /**
   * Execute a tool for Call Stages
   * @param {string} toolName - The name of the tool to execute
   * @param {Object} params - The parameters for the tool
   * @returns {Promise<Object>} - Tool response data
   */
  executeToolForStage: async (toolName, params) => {
    try {
      if (!toolEndpoints[toolName]) {
        throw new Error(`Unknown tool: ${toolName}`);
      }
      
      console.log(`Executing ${toolName} tool with params:`, params);
      const response = await apiClient.post(toolEndpoints[toolName], params);
      console.log(`${toolName} executed successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error executing ${toolName}:`, error);
      throw error;
    }
  }
};

export default api; 