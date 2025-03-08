/**
 * Call functions for the Ultravox API
 * 
 * Note: This is a placeholder for the actual implementation.
 * You'll need to adapt this to work with React Native and add the ultravox-client library.
 */

// Import the actual ultravox-client library
import { UltravoxSession, Role, Transcript, UltravoxExperimentalMessageEvent, UltravoxSessionStatus } from 'ultravox-client';

// Re-export Role so it can be imported by components
export { Role };

let uvSession = null;
const debugMessages = new Set(["debug"]);

// Backend server URL - update with your actual server URL
const BACKEND_SERVER_URL = 'http://localhost:3000';

// Keep a reference to the original window.open and location.replace functions
const originalWindowOpen = window.open;
const originalLocationReplace = window.location.replace;
const originalLocationAssign = window.location.assign;

/**
 * Set up interceptors for navigation attempts
 */
function setupInterceptors() {
  // Intercept window.open
  window.open = function(url, target, features) {
    console.log('Intercepted window.open attempt:', url);
    return null;
  };

  // Intercept location.replace
  window.location.replace = function(url) {
    console.log('Intercepted location.replace attempt:', url);
    return;
  };

  // Intercept location.assign
  window.location.assign = function(url) {
    console.log('Intercepted location.assign attempt:', url);
    return;
  };

  // Intercept form submissions
  document.addEventListener('submit', function(e) {
    console.log('Intercepted form submission');
    e.preventDefault();
    return false;
  }, true);
}

/**
 * Restore original navigation functions
 */
function restoreInterceptors() {
  window.open = originalWindowOpen;
  window.location.replace = originalLocationReplace;
  window.location.assign = originalLocationAssign;
}

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
 * All requests are made using fetch to ensure they remain in the same view
 */
async function createCall(callConfig) {
  try {
    // Extract only the parameters that the Ultravox API endpoint accepts
    const validAPIParams = {
      systemPrompt: callConfig.systemPrompt,
      temperature: callConfig.temperature,
      model: callConfig.model,
      voice: callConfig.voice, 
      languageHint: callConfig.languageHint,
      selectedTools: callConfig.selectedTools || []
    };

    // Use the backend server instead of calling Ultravox API directly
    const response = await fetch(`${BACKEND_SERVER_URL}/api/ultravox/calls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validAPIParams),
      redirect: 'follow'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating call:', error);
    throw error;
  }
}

/**
 * Start a call session with the specified callbacks and configuration
 */
export async function startCall(callbacks, callConfig) {
  try {
    // Setup interceptors to prevent navigation
    setupInterceptors();
    
    // Create the call via our backend to get a join URL
    const callData = await createCall(callConfig);
    
    // Create a hidden container for the Ultravox session
    const ultravoxContainer = document.createElement('div');
    ultravoxContainer.id = 'ultravox-container';
    ultravoxContainer.style.display = 'none';
    ultravoxContainer.style.position = 'absolute';
    ultravoxContainer.style.top = '-9999px';
    document.body.appendChild(ultravoxContainer);
    
    // Create the Ultravox session with appropriate parameters
    uvSession = new UltravoxSession({ 
      experimentalMessages: debugMessages,
      preventRedirect: true,
      disablePageReplacement: true,
      embeddedMode: true,
      containerElement: ultravoxContainer,
      preventUIReplacement: true
    });
    
    // Set up event listeners
    uvSession.addEventListener('status', (event) => {
      if (callbacks.onStatusChange && uvSession !== null) {
        callbacks.onStatusChange(uvSession.status, uvSession.transcripts);
      }
    });
    
    uvSession.addEventListener('transcripts', (event) => {
      if (callbacks.onTranscriptChange) {
        callbacks.onTranscriptChange(uvSession.transcripts);
      }
    });
    
    if (callbacks?.onDebugMessage) {
      uvSession.addEventListener('experimental_message', (msg) => {
        callbacks.onDebugMessage(msg);
      });
    }
    
    // Join the call with the join URL and appropriate parameters
    await uvSession.joinCall(callData.joinUrl, { 
      preventNavigation: true,
      disablePageReplacement: true,
      embeddedMode: true,
      keepExistingUI: true,
      participantRole: Role.USER
    });
    return uvSession;
  } catch (error) {
    console.error('Error starting call:', error);
    throw error;
  }
}

/**
 * End the current call session
 */
export async function endCall() {
  try {
    if (uvSession) {
      await uvSession.leaveCall();
      uvSession = null;
    }
    
    // Clean up the container
    const container = document.getElementById('ultravox-container');
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    
    // Restore original interceptors
    restoreInterceptors();
    
    return true;
  } catch (error) {
    console.error('Error ending call:', error);
    throw error;
  }
} 