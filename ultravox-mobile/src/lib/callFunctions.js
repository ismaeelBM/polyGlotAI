/**
 * Call functions for the Ultravox API
 * 
 * Note: This is a placeholder for the actual implementation.
 * You'll need to adapt this to work with React Native and add the ultravox-client library.
 */

// Import the actual ultravox-client library
import { UltravoxSession, Role, Transcript, UltravoxExperimentalMessageEvent, UltravoxSessionStatus } from 'ultravox-client';

let uvSession = null;
const debugMessages = new Set(["debug"]);

// Backend server URL - update with your actual server URL
const BACKEND_SERVER_URL = 'http://localhost:3000';

/**
 * Toggle mute state for either user (mic) or agent (speaker)
 */
export function toggleMute(role) {
  if (uvSession) {
    // Toggle (user) Mic
    if (role === Role.USER) {
      uvSession.isMicMuted ? uvSession.unmuteMic() : uvSession.muteMic();
    } 
    // Mute (agent) Speaker
    else {
      uvSession.isSpeakerMuted ? uvSession.unmuteSpeaker() : uvSession.muteSpeaker();
    }
  } else {
    console.error('uvSession is not initialized.');
  }
}

/**
 * Create a call via the backend server that proxies to the Ultravox API
 */
async function createCall(callConfig, showDebugMessages = false) {
  try {
    if (showDebugMessages) {
      console.log(`Using model ${callConfig.model}`);
    }

    // Use the backend server instead of calling Ultravox API directly
    const response = await fetch(`${BACKEND_SERVER_URL}/api/ultravox/calls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...callConfig }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();

    if (showDebugMessages) {
      console.log(`Call created. Join URL: ${data.joinUrl}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error creating call:', error);
    throw error;
  }
}

/**
 * Start a call with Ultravox
 */
export async function startCall(callbacks, callConfig, showDebugMessages = false) {
  try {
    const callData = await createCall(callConfig, showDebugMessages);
    const joinUrl = callData.joinUrl;

    if (!joinUrl && !uvSession) {
      console.error('Join URL is required');
      return;
    }
    
    console.log('Joining call:', joinUrl);

    // Start up our Ultravox Session with the real client
    uvSession = new UltravoxSession({ experimentalMessages: debugMessages });

    if (showDebugMessages) {
      console.log('uvSession created');
    }

    if (uvSession) {
      uvSession.addEventListener('status', (event) => {
        callbacks.onStatusChange(uvSession?.status);
      });
  
      uvSession.addEventListener('transcripts', (event) => {
        callbacks.onTranscriptChange(uvSession?.transcripts);
      });
  
      uvSession.addEventListener('experimental_message', (msg) => {
        callbacks?.onDebugMessage?.(msg);
      });

      // Add registerToolImplementation if your callConfig has tools
      if (callConfig.selectedTools && callConfig.selectedTools.length > 0) {
        callConfig.selectedTools.forEach(tool => {
          if (tool.temporaryTool && tool.temporaryTool.modelToolName === "updateOrder") {
            uvSession.registerToolImplementation(
              "updateOrder",
              (parameters) => {
                console.log("Received order details update:", parameters.orderDetailsData);
                
                if (typeof window !== "undefined") {
                  const event = new CustomEvent("orderDetailsUpdated", {
                    detail: parameters.orderDetailsData,
                  });
                  window.dispatchEvent(event);
                }
                
                return "Updated the order details.";
              }
            );
          }
        });
      }

      // Join the call with the provided URL
      uvSession.joinCall(joinUrl);
      console.log('Session status:', uvSession.status);
    }

    console.log('Call started!');
  } catch (error) {
    console.error('Error starting call:', error);
    callbacks.onStatusChange(`Error: ${error.message}`);
  }
}

/**
 * End an active call
 */
export async function endCall() {
  console.log('Call ended.');

  if (uvSession) {
    uvSession.leaveCall();
    uvSession = null;
  }

  // Dispatch a custom event when the call ends
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('callEnded');
    window.dispatchEvent(event);
  }

  // Return a resolved promise since this is an async function
  return Promise.resolve();
} 