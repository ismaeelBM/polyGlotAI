/**
 * Test script to simulate a call to the Ultravox API through ngrok
 * Based on the official Ultravox API documentation
 */

const axios = require('axios');

// The ngrok URL to your server
const NGROK_URL = 'https://4c64-2604-3d09-6775-dc00-c0d4-fc29-8a3b-5301.ngrok-free.app';

// Correct call creation data based on Ultravox API requirements
// https://docs.ultravox.ai/api-reference/calls/calls-post
const callData = {
  systemPrompt: "You are a helpful AI assistant. Keep your responses brief and conversational.",
  temperature: 0.7,
  model: "fixie-ai/ultravox", // Official model from docs
  initialMessages: [
    {
      role: "MESSAGE_ROLE_AGENT", // Correct enum value from docs
      text: "Hello, I'm your Ultravox AI assistant. How can I help you today?"
    }
  ],
  joinTimeout: "15s", // String format with units
  maxDuration: "300s", // String format with units
  timeExceededMessage: "Our conversation has reached its time limit. Thank you for chatting with me.",
  recordingEnabled: true,
  firstSpeaker: "FIRST_SPEAKER_AGENT", // Correct enum value
  transcriptOptional: false
};

// Make the API call
async function testUltravoxCall() {
  console.log('Making test call to Ultravox API via ngrok...');
  console.log(`URL: ${NGROK_URL}/api/ultravox/calls`);
  console.log('Request data:', JSON.stringify(callData, null, 2));
  
  try {
    const response = await axios({
      method: 'POST',
      url: `${NGROK_URL}/api/ultravox/calls`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: callData
    });
    
    console.log('\n✅ Call created successfully!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.joinUrl) {
      console.log('\n🔗 Call join URL:', response.data.joinUrl);
    }
    
    return response.data;
  } catch (error) {
    console.error('\n❌ Error creating call:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error message:', error.message);
    }
    
    throw error;
  }
}

// Run the test
testUltravoxCall()
  .then(() => console.log('\nTest completed successfully'))
  .catch(() => console.log('\nTest failed')); 