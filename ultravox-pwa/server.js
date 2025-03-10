require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Log environment variables
console.log('Server starting with:');
console.log('- PORT:', PORT);
console.log('- ULTRAVOX_API_URL:', process.env.ULTRAVOX_API_URL || 'Not set');
console.log('- ULTRAVOX_API_KEY:', process.env.ULTRAVOX_API_KEY ? '(Set)' : 'Not set'); 

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Ultravox PWA Backend API is running' });
});

// Proxy endpoint for Ultravox API calls - matches the working example
app.post('/api/ultravox/calls', async (req, res) => {
  try {
    console.log('Received call creation request:', req.body);
    
    // Check for required environment variables
    if (!process.env.ULTRAVOX_API_URL || !process.env.ULTRAVOX_API_KEY) {
      console.error('Missing required environment variables: ULTRAVOX_API_URL or ULTRAVOX_API_KEY');
      return res.status(500).json({
        error: 'Server Configuration Error',
        message: 'Missing API credentials. Please check server configuration.'
      });
    }
    
    // Create the Ultravox API request - exact match to working example
    const response = await axios({
      method: 'POST',
      url: `${process.env.ULTRAVOX_API_URL}/api/calls`,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.ULTRAVOX_API_KEY
      },
      data: req.body
    });
    
    console.log('Call created successfully, join URL:', response.data.joinUrl);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error creating call:', error.message);
    
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
}); 