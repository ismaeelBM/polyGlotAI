import api from './api';
import { UltravoxSession, Role } from 'ultravox-client';

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
 * Simplified to not depend on scenario or difficulty level
 */
export function generateSystemPrompt(tutor) {
  return `You are ${tutor.name}, a ${tutor.language} language learning assistant specializing in ${tutor.specialty}. 
Your role is to help the student practice ${tutor.language}.

Your goal is to:
1. Have a conversation with the student in ${tutor.language}
2. Ask what the student wants to learn today
3. Teach the student what they want to learn breaking it down into small chunks
4. Ask the student to practice what they've learned
5. Correct the student's grammar and pronunciation
6. End the conversation naturally after about 5 minutes

Start by greeting the student in ${tutor.language} and then in English.`;
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
      firstSpeakerSettings: {
        agent: {
          uninterruptible: true,
          text: "Hello! I'm your language tutor. How can I help you today?"
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
        turnEndpointDelay: "1s",
        minimumTurnDuration: "1s",
        minimumInterruptionDuration: "1s"
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
        console.log('CallService: Raw status event:', event);
        
        if (callbacks?.onStatusChange) {
          const status = event.detail || event.status || uvSession?.status;
          callbacks.onStatusChange(status);
          console.log('CallService: Status changed:', {
            status,
            sessionStatus: uvSession?.status,
            timestamp: new Date().toISOString()
          });
          
          // Log transcripts whenever status changes
          if (uvSession?.transcripts) {
            console.log('CallService: Current transcripts on status change:', {
              count: uvSession.transcripts.length,
              timestamp: new Date().toISOString()
            });
          }
        }
      });
      
      uvSession.addEventListener('transcripts', (event) => {
        console.log('CallService: Raw transcript event:', event);
        
        const transcripts = event.detail || event.transcripts || uvSession?.transcripts;
        
        console.log('CallService: Transcript event received:', {
          hasTranscripts: !!transcripts,
          count: transcripts?.length,
          timestamp: new Date().toISOString()
        });

        if (callbacks?.onTranscriptChange && transcripts) {
          console.log('CallService: Sending transcripts to callback:', {
            count: transcripts.length,
            latest: transcripts[transcripts.length - 1]?.text,
            timestamp: new Date().toISOString()
          });
          callbacks.onTranscriptChange(transcripts);
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