require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Ultravox Mobile Backend API is running');
});

// Proxy endpoint for Ultravox API calls
app.post('/api/ultravox/calls', async (req, res) => {
  try {
    console.log('Received call creation request:', req.body);
    
    const response = await axios({
      method: 'POST',
      url: `${process.env.ULTRAVOX_API_URL}/api/calls`,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.ULTRAVOX_API_KEY
      },
      data: req.body
    });
    
    console.log('Call created successfully, response:', response.data);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error creating call:', error.message);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
      
      res.status(error.response.status).json({
        error: 'Error from Ultravox API',
        message: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from Ultravox API');
      
      res.status(500).json({
        error: 'No response from Ultravox API',
        message: 'The request was made but no response was received'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 