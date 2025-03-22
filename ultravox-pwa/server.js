require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Add a configurable base URL for tools - default to localhost for development
const TOOL_BASE_URL = process.env.TOOL_BASE_URL || `https://localhost:${PORT}`;

// Log environment variables
console.log('Server starting with:');
console.log('- PORT:', PORT);
console.log('- ULTRAVOX_API_URL:', process.env.ULTRAVOX_API_URL || 'Not set');
console.log('- ULTRAVOX_API_KEY:', process.env.ULTRAVOX_API_KEY ? '(Set)' : 'Not set'); 
console.log('- TOOL_BASE_URL:', TOOL_BASE_URL);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Ultravox PWA Backend API is running' });
});

// Tool handler for changing to testing mode
app.post('/api/tools/changeToTestingMode', async (req, res) => {
  try {
    console.log('Received changeToTestingMode request:', req.body);
    
    const { language, level } = req.body;
    
    // Validate required parameters
    if (!language || !level) {
      return res.status(400).json({
        error: 'Missing Parameters',
        message: 'Language and level are required'
      });
    }
    
    // Create the new stage parameters with a focused system prompt for testing
    const responseBody = {
      systemPrompt: `You are now in TESTING MODE for ${language} at ${level} level.
Your role is to ask appropriate questions to test the user's knowledge of ${language}.
Ask one question at a time, wait for their response, then provide feedback before moving to the next question.
Track their performance to provide a final assessment after 5-10 questions.
Questions should focus on vocabulary, grammar, and sentence construction appropriate for ${level} level.
When the test is complete, use the endTestingMode tool with the results.`,
      
      // You can also change voice or other parameters if needed
      // voice: "voice_id_for_language",
      
      // Experimental - keep the tools available in the new stage
      selectedTools: [
        {
          "temporaryTool": {
            "modelToolName": "endTestingMode",
            "description": "Ends the testing mode and returns to normal conversation",
            "dynamicParameters": [
              {
                "name": "correct",
                "location": "PARAMETER_LOCATION_BODY",
                "schema": {"type": "integer", "description": "Number of correct answers"},
                "required": true
              },
              {
                "name": "total",
                "location": "PARAMETER_LOCATION_BODY",
                "schema": {"type": "integer", "description": "Total number of questions asked"},
                "required": true
              },
              {
                "name": "feedback",
                "location": "PARAMETER_LOCATION_BODY",
                "schema": {"type": "string", "description": "Brief feedback on performance"},
                "required": true
              }
            ],
            "http": {
              "baseUrlPattern": `${TOOL_BASE_URL}/api/tools/endTestingMode`,
              "httpMethod": "POST"
            }
          }
        }
      ],
      
      // This text will appear in the conversation history
      toolResultText: `(Entering ${language} Testing Mode at ${level} level)`
    };
    
    console.log('Sending stage change response:', responseBody);
    
    // Respond with new stage response type header
    res.set('X-Ultravox-Response-Type', 'new-stage');
    res.status(200).json(responseBody);
    
  } catch (error) {
    console.error('Error in changeToTestingMode tool:', error.message);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Tool handler for ending testing mode
app.post('/api/tools/endTestingMode', async (req, res) => {
  try {
    console.log('Received endTestingMode request:', req.body);
    
    const { correct, total, feedback } = req.body;
    
    // Create the new stage parameters to return to normal conversation
    const responseBody = {
      systemPrompt: `You are an expert language tutor. You've just completed a language assessment with the user.
Continue the conversation naturally, referring to their performance in the test if relevant.
If the user asks to be tested again, use the changeToTestingMode tool to start a new test.`,
      
      // Return to the original tools
      selectedTools: [
        {
          "temporaryTool": {
            "modelToolName": "changeToTestingMode",
            "description": "Changes the conversation to a structured language testing mode when the user requests to be tested or practice",
            "dynamicParameters": [
              {
                "name": "language",
                "location": "PARAMETER_LOCATION_BODY",
                "schema": {"type": "string", "description": "The language to test (e.g., Spanish, French, German)"},
                "required": true
              },
              {
                "name": "level",
                "location": "PARAMETER_LOCATION_BODY",
                "schema": {"type": "string", "description": "Proficiency level (beginner, intermediate, advanced)"},
                "required": true
              }
            ],
            "http": {
              "baseUrlPattern": `${TOOL_BASE_URL}/api/tools/changeToTestingMode`,
              "httpMethod": "POST"
            }
          }
        }
      ],
      
      // This text will appear in the conversation history
      toolResultText: `(Test Completed: ${correct}/${total} correct. ${feedback})`
    };
    
    console.log('Sending stage change response:', responseBody);
    
    // Respond with new stage response type header
    res.set('X-Ultravox-Response-Type', 'new-stage');
    res.status(200).json(responseBody);
    
  } catch (error) {
    console.error('Error in endTestingMode tool:', error.message);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
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