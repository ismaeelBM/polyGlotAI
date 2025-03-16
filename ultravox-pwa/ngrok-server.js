/**
 * ngrok-server.js - Ultravox PWA Server with ngrok support
 * This server is designed to be exposed online using ngrok
 */

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.NGROK_PORT || 3002; // Using a different default port to avoid conflicts

// Log environment variables
console.log('Ngrok server starting with:');
console.log('- PORT:', PORT);
console.log('- ULTRAVOX_API_URL:', process.env.ULTRAVOX_API_URL || 'Not set');
console.log('- ULTRAVOX_API_KEY:', process.env.ULTRAVOX_API_KEY ? '(Set)' : 'Not set'); 

// Middleware
app.use(cors());
app.use(express.json());

// Add specific middleware for ngrok
app.use((req, res, next) => {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  console.log(`Received ${req.method} request at ${protocol}://${host}${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Ultravox PWA Backend API is running via ngrok',
    serverTime: new Date().toISOString()
  });
});

// Proxy endpoint for Ultravox API calls
app.post('/api/ultravox/calls', async (req, res) => {
  try {
    console.log('Received call creation request via ngrok:', req.body);
    
    // Check for required environment variables
    if (!process.env.ULTRAVOX_API_URL || !process.env.ULTRAVOX_API_KEY) {
      console.error('Missing required environment variables: ULTRAVOX_API_URL or ULTRAVOX_API_KEY');
      return res.status(500).json({
        error: 'Server Configuration Error',
        message: 'Missing API credentials. Please check server configuration.'
      });
    }
    
    // Create the Ultravox API request
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

// Start the server - listen on all network interfaces for ngrok
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Ngrok-enabled server running at http://0.0.0.0:${PORT}`);
  console.log(`📋 Health check available at http://localhost:${PORT}/api/health`);
  console.log(`\n📢 To expose this server with ngrok:`);
  console.log(`1. Install ngrok if you haven't already: https://ngrok.com/download`);
  console.log(`2. Run: ngrok http ${PORT}`);
  console.log(`3. Use the https URL provided by ngrok to access your API remotely\n`);
}); 