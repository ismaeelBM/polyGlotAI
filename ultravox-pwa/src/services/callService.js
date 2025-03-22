import api from './api';
import { UltravoxSession, Role } from 'ultravox-client';

// Global reference to the current Ultravox session
let uvSession = null;

// For debug messages (logs all experimental messages)
const debugMessages = new Set(["debug"]);

// Base URL for tool endpoints - should match server configuration
// In production, this should be your ngrok or publicly accessible HTTPS URL
// Force HTTPS protocol - this is required by Ultravox
const TOOL_BASE_URL = process.env.REACT_APP_TOOL_BASE_URL || 
  (window.location.origin.includes('localhost') 
    ? `https://${window.location.hostname}:${window.location.port}`
    : window.location.origin);

// Log the tool base URL to debug
console.log('Client using tool base URL:', TOOL_BASE_URL);

/**
 * Toggle mute state for either user (mic) or agent (speaker)
 */
export function toggleMute(role) {
  if (uvSession) {
    try {
      // Toggle (user) Mic
      if (role === Role.USER) {
        uvSession.isMicMuted ? uvSession.unmuteMic() : uvSession.muteMic();
      } 
      // Mute (agent) Speaker
      else {
        uvSession.isSpeakerMuted ? uvSession.unmuteSpeaker() : uvSession.muteSpeaker();
      }
    } catch (error) {
      console.error('Error toggling mute state:', error);
    }
  } else {
    console.error('uvSession is not initialized.');
  }
}

/**
 * Create a system prompt based on the tutor information
 * Includes instructions for using the testing mode tool when user requests
 */
export function generateSystemPrompt(tutor) {
  console.log('Tutor language: ', tutor.language, 'Tutor specialty: ', tutor.specialty);
  return `You are an expert language tutor specializing in teaching ${tutor.language || 'multiple languages'}. 
Your role is to help users learn the language through conversation and practice.

If the user asks to be tested on their language skills or wants a quiz to practice, use the changeToTestingMode tool to switch to a structured testing mode. 
Do not simulate the test - actually use the tool to change the conversation mode.

In testing mode, you'll present structured questions appropriate for their level and evaluate their responses.
In normal conversation, be helpful, engaging, and respond primarily in ${tutor.language || 'the language the user is practicing'}.`;
}

/**
 * Create a call via the backend server that proxies to the Ultravox API
 */
export async function createCall(callConfig) {
  try {
    // Extract only the parameters that the Ultravox API endpoint accepts
    const validAPIParams = {
      systemPrompt: callConfig.systemPrompt,
      model: "fixie-ai/ultravox-70B",
      temperature: 0.7,
      voice: callConfig.voice || "en-US-Standard-C",
      initialOutputMedium: "MESSAGE_MEDIUM_VOICE",
      firstSpeaker: "FIRST_SPEAKER_AGENT",
      joinTimeout: "60s",
      maxDuration: "300s",
      timeExceededMessage: "Our conversation has reached its time limit. Thank you for chatting with me.",
      recordingEnabled: false,
      transcriptOptional: false,
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
        },
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
      firstSpeakerSettings: {
        agent: {
          uninterruptible: false,
          text: "Hello! I'm your language tutor. How can I help you with your language learning today?"
        }
      },
      inactivityMessages: [
        {
          duration: "10s",
          message: "Are you still there?",
          endBehavior: "END_BEHAVIOR_UNSPECIFIED"
        }
      ],
      vadSettings: {
        turnEndpointDelay: "0.5s",
        minimumTurnDuration: "0.5s",
        minimumInterruptionDuration: "0.5s"
      }
    };
    
    console.log('Creating call with parameters:', validAPIParams);
    
    // Create the call via our backend API
    const callData = await api.createCall(validAPIParams);
    console.log('Call created successfully:', callData);
    return callData;
  } catch (error) {
    console.error('Error creating call:', error);
    throw new Error(`Failed to create call: ${error.message}`);
  }
}

/**
 * Start a call session with the specified callbacks and configuration
 */
export async function startCall(callbacks, callConfig, showDebugMessages) {
  try {
    // Create the call via our backend to get a join URL
    const callData = await createCall(callConfig);
    const joinUrl = callData.joinUrl;
    
    if (!joinUrl) {
      console.error('Join URL is required');
      throw new Error('Join URL is missing from the API response');
    }

    console.log('Joining call:', joinUrl);
    
    // If there's an existing session, clean it up
    if (uvSession) {
      try {
        uvSession.leaveCall();
      } catch (e) {
        console.warn('Error cleaning up previous session:', e);
      }
      uvSession = null;
    }
    
    // Start up our Ultravox Session
    uvSession = new UltravoxSession({ experimentalMessages: debugMessages });
    
    if (showDebugMessages) {
      console.log('uvSession created:', uvSession);
    }
    
    if (uvSession) {
      // Set up event listeners
      uvSession.addEventListener('status', (event) => {
        if (callbacks?.onStatusChange) {
          callbacks.onStatusChange(uvSession?.status, uvSession?.transcripts);
          console.log('Status changed:', uvSession?.status);
          
          // Log transcripts whenever status changes
          if (uvSession?.transcripts) {
            console.log('Current transcripts:', uvSession.transcripts);
          }
        }
      });
      
      uvSession.addEventListener('transcripts', (event) => {
        // console.log('Transcript event received:', event);
        if (callbacks?.onTranscriptChange && uvSession?.transcripts) {
          // console.log('Sending transcripts to callback:', uvSession.transcripts);
          callbacks.onTranscriptChange(uvSession.transcripts);
        }
      });
      
      if (callbacks?.onDebugMessage) {
        uvSession.addEventListener('experimental_message', (msg) => {
          console.log('Ultravox experimental message:', msg);
          callbacks.onDebugMessage(msg);
        });
      }
      
      // Add a manual status check after 5 seconds in case we don't get events
      setTimeout(() => {
        if (uvSession) {
          console.log('Manual status check after 5 seconds:', uvSession?.status);
          if (uvSession?.status && callbacks?.onStatusChange) {
            callbacks.onStatusChange(uvSession.status, uvSession.transcripts);
          }
        }
      }, 5000);
      
      // CRITICAL: NO AWAIT - EXACT MATCH TO WORKING EXAMPLE
      console.log('About to join call with URL:', joinUrl);
      uvSession.joinCall(joinUrl);
      console.log('Session status after join call:', uvSession.status);
      
      return uvSession;
    } else {
      throw new Error('Failed to initialize Ultravox session');
    }
  } catch (error) {
    console.error('Error starting call:', error);
    
    // Clean up on error
    if (uvSession) {
      try {
        uvSession.leaveCall();
      } catch (e) {
        console.warn('Error during error cleanup:', e);
      }
      uvSession = null;
    }
    
    throw error;
  }
}

/**
 * End the current call session
 */
export async function endCall() {
  console.log('Call ended.');
  
  if (uvSession) {
    try {
      uvSession.leaveCall();
    } catch (error) {
      console.warn('Error leaving call:', error);
    }
    uvSession = null;
  }
  
  // Dispatch an event when the call ends
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('callEnded');
    window.dispatchEvent(event);
  }
  
  return true;
}

// Export Role for use in components
export { Role }; 