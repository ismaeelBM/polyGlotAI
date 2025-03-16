require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

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

// Proxy endpoint for Ultravox API calls
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

// Add Gemini API integration
console.log('Initializing Gemini API with key:', process.env.GEMINI_API_KEY ? '(Set)' : 'Not set');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Analyze transcript endpoint
app.post('/api/analyze-transcript', async (req, res) => {
  console.log('Received analyze request:', {
    hasText: !!req.body.text,
    textLength: req.body.text?.length,
    language: req.body.language,
    timestamp: new Date().toISOString()
  });

  const { text, language } = req.body;
  
  if (!text) {
    console.log('No text provided in request');
    return res.status(400).json({ error: 'No text provided' });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not configured');
    return res.status(500).json({ error: 'Gemini API not configured' });
  }

  try {
    console.log('Initializing Gemini model');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Analyze this conversation in ${language}. Extract 3-5 key words or phrases that are important
    for language learning. For each word/phrase provide:
    1. The word or phrase itself
    2. Its translation
    3. Cultural or usage context
    
    Format your response as a JSON object with this structure:
    {
      "words": [
        {
          "word": "example word",
          "translation": "translation here",
          "context": "cultural/usage context here"
        }
      ]
    }
    
    Conversation text:
    ${text}`;

    console.log('Sending request to Gemini:', {
      promptLength: prompt.length,
      language,
      timestamp: new Date().toISOString()
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    console.log('Received Gemini response:', {
      responseLength: responseText.length,
      timestamp: new Date().toISOString()
    });
    
    try {
      const parsedResponse = JSON.parse(responseText);
      console.log('Successfully parsed response:', {
        words: parsedResponse.words?.length,
        timestamp: new Date().toISOString()
      });
      res.json(parsedResponse);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', {
        error: parseError.message,
        responseText,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({ 
        error: 'Failed to parse analysis response',
        raw: responseText 
      });
    }
  } catch (error) {
    console.error('Error calling Gemini API:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: 'Failed to analyze transcript' });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, 'build')));

  // The "catchall" handler: for any request that doesn't
  // match one above, send back React's index.html file.
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
}); 