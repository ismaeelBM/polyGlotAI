import api from './api';
import { UltravoxSession, Role, UltravoxSessionStatus } from 'ultravox-client';

// Global reference to the current Ultravox session
let uvSession = null;

// For debug messages (logs all experimental messages)
const debugMessages = new Set(["debug"]);

/**
 * Toggle mute state for either user (mic) or agent (speaker)
 */
export function toggleMute(role) {
  if (uvSession) {
    try {
      // Toggle (user) Mic
      if (role == Role.USER) {
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
 * Create a system prompt based on the current language learning context
 */
export function generateSystemPrompt(tutor, scenario, difficulty) {
  // Set difficulty level text
  const difficultyText = difficulty === 1 ? 'beginner' : 
                         difficulty === 2 ? 'intermediate' : 'advanced';
  
  return `You are ${tutor.name}, a ${tutor.language} language tutor specializing in ${tutor.specialty}. 
Your role is to help the student practice ${tutor.language} in a scenario: "${scenario.name}".

Difficulty level: ${difficultyText}. ${difficulty === 1 ? 'Use simple vocabulary and speak slowly.' : 
                       difficulty === 2 ? 'Use moderate vocabulary and natural speed.' : 
                       'Use advanced vocabulary, idioms, and normal conversational speed.'}

Your goal is to:
1. Guide the student through a realistic conversation in this scenario
2. Correct major errors but don't interrupt the flow too much
3. Introduce useful vocabulary and phrases naturally
4. Adapt to the student's level and support them when they struggle
5. Keep responses concise and conversational (1-3 sentences is ideal)
6. End the conversation naturally after about 5 minutes

Start by greeting the student in ${tutor.language} and then in English, and set up the scenario. Then continue primarily in ${tutor.language}, but you can occasionally use English to explain complex concepts if needed.`;
}

/**
 * Create a call via the backend server that proxies to the Ultravox API
 */
export async function createCall(callConfig) {
  try {
    // Extract only the parameters that the Ultravox API endpoint accepts
    const validAPIParams = {
      systemPrompt: callConfig.systemPrompt,
      temperature: callConfig.temperature || 0.4,
      model: callConfig.model || "fixie-ai/ultravox-70B",
      voice: callConfig.voice, 
      languageHint: callConfig.languageHint,
      selectedTools: callConfig.selectedTools || []
    };
    
    console.log('Creating call with parameters:', validAPIParams);
    
    // Create the call via our backend API
    const callData = await api.createCall(validAPIParams);
    console.log('Call created successfully:', callData);
    return callData;
  } catch (error) {
    console.error('Error creating call:', error);
    throw error;
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
    
    // Start up our Ultravox Session - EXACT MATCH TO WORKING EXAMPLE
    uvSession = new UltravoxSession({ experimentalMessages: debugMessages });
    
    if (showDebugMessages) {
      console.log('uvSession created:', uvSession);
    }
    
    if (uvSession) {
      // Set up event listeners - EXACT MATCH TO WORKING EXAMPLE
      uvSession.addEventListener('status', (event) => {
        callbacks.onStatusChange(uvSession?.status);
      });
      
      uvSession.addEventListener('transcripts', (event) => {
        callbacks.onTranscriptChange(uvSession?.transcripts);
      });
      
      if (callbacks?.onDebugMessage) {
        uvSession.addEventListener('experimental_message', (msg) => {
          callbacks.onDebugMessage(msg);
        });
      }
      
      // CRITICAL: NO AWAIT - EXACT MATCH TO WORKING EXAMPLE
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
  
  // Dispatch an event when the call ends (similar to working example)
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('callEnded');
    window.dispatchEvent(event);
  }
  
  return true;
}

// Export Role for use in components
export { Role }; 