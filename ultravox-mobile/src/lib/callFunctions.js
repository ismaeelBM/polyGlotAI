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
const originalWebSocket = window.WebSocket;

// Keep track of active websockets
const activeWebsockets = new Set();

/**
 * Set up interceptors for navigation attempts and WebSocket creation
 */
function setupInterceptors() {
  // Intercept window.open
  window.open = function(url, target, features) {
    console.log('Intercepted window.open attempt:', url);
    // Instead of opening in a new window, just log it
    return null;
  };

  // Intercept location.replace
  window.location.replace = function(url) {
    console.log('Intercepted location.replace attempt:', url);
    // Do nothing to prevent navigation
    return;
  };

  // Intercept location.assign
  window.location.assign = function(url) {
    console.log('Intercepted location.assign attempt:', url);
    // Do nothing to prevent navigation
    return;
  };

  // Intercept WebSocket creation
  window.WebSocket = function(url, protocols) {
    console.log('Intercepted WebSocket creation:', url);
    
    // Create the actual WebSocket
    const ws = new originalWebSocket(url, protocols);
    
    // Add to our tracking set
    activeWebsockets.add(ws);
    
    // Remove from tracking when closed
    ws.addEventListener('close', () => {
      activeWebsockets.delete(ws);
      console.log('WebSocket closed and removed from tracking');
    });
    
    return ws;
  };
  
  // Copy prototype properties
  for (const prop in originalWebSocket) {
    if (originalWebSocket.hasOwnProperty(prop)) {
      window.WebSocket[prop] = originalWebSocket[prop];
    }
  }
  window.WebSocket.prototype = originalWebSocket.prototype;

  // Also intercept any form submissions
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
  window.WebSocket = originalWebSocket;
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
async function createCall(callConfig, showDebugMessages = false) {
  try {
    if (showDebugMessages) {
      console.log(`Using model ${callConfig.model}`);
    }

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
    // Using fetch ensures we stay in the same view/tab
    const response = await fetch(`${BACKEND_SERVER_URL}/api/ultravox/calls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validAPIParams),
      // Ensure no redirect happens
      redirect: 'follow'
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
 * Prepare an iframe to contain the Ultravox session
 * This prevents the session from taking over the main UI
 */
function prepareSessionContainer() {
  // Create a container div that will hold our iframe
  const containerDiv = document.createElement('div');
  containerDiv.id = 'ultravox-outer-container';
  
  // Apply strict containment styles
  const containmentStyles = {
    position: 'fixed',
    opacity: '0',
    pointerEvents: 'none',
    top: '-10000px',
    left: '-10000px',
    width: '0',
    height: '0',
    overflow: 'hidden',
    zIndex: '-9999',
    display: 'none',
    visibility: 'hidden',
    transform: 'scale(0)',
    margin: '0',
    padding: '0',
    border: 'none',
    minWidth: '0',
    minHeight: '0',
    maxWidth: '0',
    maxHeight: '0',
    flex: '0 0 0',
    boxSizing: 'border-box'
  };
  
  Object.assign(containerDiv.style, containmentStyles);
  containerDiv.setAttribute('aria-hidden', 'true');
  
  // Create inner div with same strict containment
  const innerDiv = document.createElement('div');
  innerDiv.id = 'ultravox-container';
  Object.assign(innerDiv.style, containmentStyles);
  containerDiv.appendChild(innerDiv);

  // Create an iframe with same strict containment
  const iframe = document.createElement('iframe');
  iframe.id = 'ultravox-isolation-frame';
  Object.assign(iframe.style, containmentStyles);
  iframe.title = 'Ultravox Isolated Container';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('tabindex', '-1');
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('allowtransparency', 'true');
  
  // Add the iframe to our container
  containerDiv.appendChild(iframe);

  // Add to document but within a zero-size container
  const zeroContainer = document.createElement('div');
  Object.assign(zeroContainer.style, containmentStyles);
  zeroContainer.appendChild(containerDiv);
  document.body.appendChild(zeroContainer);

  // Try to use the iframe's document for further isolation
  let iframeElement;
  try {
    if (iframe.contentWindow && iframe.contentWindow.document) {
      const iframeDoc = iframe.contentWindow.document;
      Object.assign(iframeDoc.body.style, containmentStyles);
      
      // Create an element inside the iframe
      iframeElement = iframeDoc.createElement('div');
      iframeElement.id = 'ultravox-iframe-container';
      Object.assign(iframeElement.style, containmentStyles);
      iframeDoc.body.appendChild(iframeElement);
      
      // Add strict containment styles to the iframe's HTML and body
      Object.assign(iframeDoc.documentElement.style, containmentStyles);
    }
  } catch (e) {
    console.warn('Could not access iframe document, using standard container instead:', e);
  }

  return {
    containerElement: iframeElement || innerDiv,
    outerContainer: containerDiv,
    iframe
  };
}

/**
 * Create a MutationObserver to prevent the Ultravox client from
 * modifying any DOM elements outside its container
 */
function createDOMGuardian(containerElement) {
  // Set up mutation observer to watch for DOM changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // Check if the mutation is outside our container
      if (!containerElement.contains(mutation.target) && 
          mutation.target !== containerElement && 
          mutation.target.id !== 'ultravox-outer-container' &&
          mutation.target.id !== 'ultravox-container') {
        
        // Log the attempt
        console.log('Prevented DOM mutation outside container:', mutation);
        
        // If it's an attribute change, revert it
        if (mutation.type === 'attributes') {
          mutation.target.removeAttribute(mutation.attributeName);
        }
        
        // If it's a DOM node addition outside our container, remove it
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.parentNode && node.parentNode !== containerElement) {
              node.parentNode.removeChild(node);
            }
          });
        }
      }
    });
  });
  
  // Start observing the entire document
  observer.observe(document.documentElement, { 
    childList: true, 
    attributes: true, 
    characterData: true, 
    subtree: true,
    attributeOldValue: true
  });
  
  return observer;
}

/**
 * Start a call with Ultravox
 * All activity happens within the current view without opening new tabs
 */
export async function startCall(callbacks, callConfig, showDebugMessages = false) {
  try {
    // Set up interceptors to prevent navigation attempts
    setupInterceptors();
    
    // Check if there's an existing session and clean it up first
    if (uvSession) {
      try {
        uvSession.leaveCall();
        uvSession = null;
      } catch (e) {
        console.warn('Error cleaning up previous session:', e);
      }
    }

    // Clean up any existing containers
    const existingContainer = document.getElementById('ultravox-outer-container');
    if (existingContainer) {
      document.body.removeChild(existingContainer);
    }

    // Create call but don't let UI be affected at all
    console.log('Creating call with isolation mode');
    
    // Make a backup of the entire body content before starting
    const bodyContentBackup = document.body.innerHTML;
    
    const callData = await createCall(callConfig, showDebugMessages);
    const joinUrl = callData.joinUrl;

    if (!joinUrl) {
      console.error('Join URL is required');
      callbacks.onStatusChange('Error: No join URL received');
      return;
    }
    
    console.log('Joining call:', joinUrl);

    // Prepare a container that will host the Ultravox session - completely isolated
    const { containerElement, outerContainer, iframe } = prepareSessionContainer();
    
    // Create a DOM guardian to prevent the session from modifying the main UI
    const domGuardian = createDOMGuardian(containerElement);

    // Save a reference to the original document body
    const originalBody = document.body;
    const originalHTML = document.documentElement.innerHTML;
    
    // Block attempts to navigate away
    const originalNavigator = window.navigator.serviceWorker;
    window.navigator._originalServiceWorker = originalNavigator; // Save reference for restoration
    window.navigator.serviceWorker = {
      ...originalNavigator,
      register: () => Promise.resolve(),
      getRegistration: () => Promise.resolve(null),
    };
    
    // Create a MutationObserver for the entire document
    const bodyObserver = new MutationObserver((mutations) => {
      let needsRestore = false;
      
      mutations.forEach((mutation) => {
        // Check if any important app elements are removed or modified
        if (mutation.type === 'childList') {
          // Check if our app elements were removed
          const appRemoved = Array.from(mutation.removedNodes).some(node => {
            return node.id === 'root' || 
                  (node.nodeType === 1 && node.querySelector('#root')) ||
                  (node.nodeType === 1 && node.classList && node.classList.contains('conversationContainer'));
          });
          
          if (appRemoved) {
            needsRestore = true;
            console.log('App elements removed, will restore');
          }
          
          // Remove any nodes that were added outside our container
          if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
              // If it's not our container and not in our container, remove it
              if (node !== outerContainer && 
                  !outerContainer.contains(node) && 
                  node.parentNode && 
                  node.id !== 'ultravox-protection-styles' &&
                  node.tagName !== 'STYLE') {
                try {
                  node.parentNode.removeChild(node);
                  console.log('Removed foreign node:', node);
                } catch (e) {
                  console.warn('Failed to remove node:', e);
                }
              }
            });
          }
        }
      });
      
      // If we detected that important app elements were removed, restore from backup
      if (needsRestore) {
        console.log('Restoring app elements from backup');
        // Restore the body content (excludes our container which we'll add back)
        document.body.innerHTML = bodyContentBackup;
        
        // Re-add our container
        document.body.appendChild(outerContainer);
        
        // Re-apply callbacks
        callbacks.onStatusChange('active');
      }
    });
    
    bodyObserver.observe(document.body, { childList: true, subtree: true });

    // Force the app's UI to be the highest z-index
    const forceUIVisible = () => {
      const appRoot = document.getElementById('root');
      if (appRoot) {
        appRoot.style.zIndex = '99999';
        appRoot.style.position = 'relative';
        appRoot.style.display = 'block';
        appRoot.style.visibility = 'visible';
        appRoot.style.opacity = '1';
      }
      
      const elements = document.querySelectorAll('.container, .safeArea, .conversationContainer, .header, .controlsContainer');
      elements.forEach(el => {
        el.style.display = 'block';
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        el.style.zIndex = '9999';
      });
      
      // Force our container to stay hidden
      if (outerContainer) {
        outerContainer.style.position = 'fixed';
        outerContainer.style.top = '-10000px';
        outerContainer.style.left = '-10000px';
        outerContainer.style.visibility = 'hidden';
        outerContainer.style.opacity = '0';
        outerContainer.style.pointerEvents = 'none';
        outerContainer.style.zIndex = '-9999';
      }
    };
    
    // Run this right away and then periodically
    forceUIVisible();
    const visibilityInterval = setInterval(forceUIVisible, 100);
    
    // Start up our Ultravox Session with the real client in the current context
    uvSession = new UltravoxSession({ 
      experimentalMessages: debugMessages,
      // All the options to prevent page replacement
      preventRedirect: true,
      disablePageReplacement: true,
      embeddedMode: true,
      containerElement: containerElement,
      preventUIReplacement: true,
      // Custom options
      iFrameMode: true,
      useExistingUI: true,
      disableNavigation: true,
      // Enhanced options for better isolation
      disableDOMEffects: true,
      disableBodyModification: true,
      preventFullscreenEffects: true,
      preventViewportModification: true,
      sandboxed: true,
      minimizeUIInteraction: true,
      disableExternalStyleInjection: true,
      audioOnlyMode: true
    });

    if (showDebugMessages) {
      console.log('uvSession created');
    }

    if (uvSession) {
      // Store references to our observers and containers for cleanup
      uvSession._domGuardian = domGuardian;
      uvSession._bodyObserver = bodyObserver;
      uvSession._containerElements = { containerElement, outerContainer, iframe };
      uvSession._visibilityInterval = visibilityInterval;
      uvSession._originalHTML = originalHTML;
      
      // Set callbacks before joining to ensure we don't miss any initial events
      uvSession.addEventListener('status', (event) => {
        console.log('Status changed:', event);
        callbacks.onStatusChange(uvSession?.status);
        
        // Force UI visibility after any status change
        forceUIVisible();
      });
  
      uvSession.addEventListener('transcripts', (event) => {
        console.log('Transcripts updated:', event);
        callbacks.onTranscriptChange(uvSession?.transcripts);
        
        // Force UI visibility after transcript updates
        forceUIVisible();
      });
  
      uvSession.addEventListener('experimental_message', (msg) => {
        if (callbacks?.onDebugMessage) {
          callbacks.onDebugMessage(msg);
        }
      });

      // Add error listener
      uvSession.addEventListener('error', (event) => {
        console.error('Ultravox session error:', event);
        callbacks.onStatusChange(`Error: ${event.message || 'Unknown error'}`);
      });

      // Join the call with the provided URL - ensure we stay in same view
      // Use a joinCall method that doesn't trigger navigation
      try {
        // Add a mutation observer to watch for any attempts to replace our app
        const documentObserver = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.type === 'childList') {
              // If the entire body content is replaced, restore our app
              if (mutation.target === document.body && mutation.removedNodes.length > 0) {
                console.log('Detected body content replacement attempt');
                // Re-add our container
                if (!document.getElementById('ultravox-outer-container')) {
                  document.body.appendChild(outerContainer);
                }
              }
            }
          }
        });
        
        documentObserver.observe(document.documentElement, { 
          childList: true, 
          subtree: true 
        });
        
        uvSession._documentObserver = documentObserver;

        // Now join the call
        await uvSession.joinCall(joinUrl, { 
          preventNavigation: true,
          disablePageReplacement: true,
          embeddedMode: true,
          keepExistingUI: true,
          containerElement: containerElement,
          iFrameMode: true,
          // Additional parameters for stronger containment
          audioOnly: true,
          disableDOMEffects: true,
          disableBodyModification: true,
          preventFullscreenEffects: true,
          preventViewportModification: true,
          sandboxed: true,
          minimizeUIInteraction: true,
          suppressVisualElements: true
        });
        
        console.log('Session status after joining:', uvSession.status);
        callbacks.onStatusChange('active');
        
        // Additional safeguards after joining
        // Force the container to stay hidden
        if (outerContainer) {
          outerContainer.style.position = 'fixed';
          outerContainer.style.top = '-10000px';
          outerContainer.style.left = '-10000px';
          outerContainer.style.opacity = '0';
          outerContainer.style.visibility = 'hidden';
          outerContainer.style.pointerEvents = 'none';
        }
        
        // Add styles to force app visibility
        const forceAppVisibilityStyle = document.createElement('style');
        forceAppVisibilityStyle.textContent = `
          body > *:not(#ultravox-outer-container) {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            z-index: 1 !important;
          }
          #ultravox-outer-container {
            visibility: hidden !important;
            opacity: 0 !important;
            position: fixed !important;
            top: -10000px !important;
            left: -10000px !important;
            width: 1px !important;
            height: 1px !important;
            pointer-events: none !important;
            z-index: -9999 !important;
          }
        `;
        document.head.appendChild(forceAppVisibilityStyle);
        uvSession._forceAppVisibilityStyle = forceAppVisibilityStyle;
        
        // Check if our UI is still visible
        setTimeout(() => {
          // If our container isn't in the DOM, re-add it
          if (!document.getElementById('ultravox-outer-container')) {
            document.body.appendChild(outerContainer);
            console.log('Re-added container after timeout check');
          }
        }, 1000);
        
        // Start a heartbeat to keep track of WebSockets
        const websocketHeartbeat = setInterval(() => {
          // Log active websockets
          console.log(`Active WebSockets: ${activeWebsockets.size}`);
          
          // Check if each socket is still open
          activeWebsockets.forEach(ws => {
            if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
              activeWebsockets.delete(ws);
              console.log('Removed closed WebSocket from tracking');
            }
          });
        }, 5000);
        
        // Store the heartbeat for cleanup
        uvSession._websocketHeartbeat = websocketHeartbeat;
      } catch (joinError) {
        console.error('Error joining call:', joinError);
        callbacks.onStatusChange(`Error joining: ${joinError.message}`);
      }
    }

    console.log('Call started!');
  } catch (error) {
    console.error('Error starting call:', error);
    callbacks.onStatusChange(`Error: ${error.message}`);
    
    // Clean up interceptors if there was an error
    restoreInterceptors();
  }
}

/**
 * End an active call
 */
export async function endCall() {
  console.log('Call ended.');

  if (uvSession) {
    try {
      // Disconnect all observers
      if (uvSession._domGuardian) {
        uvSession._domGuardian.disconnect();
      }
      
      if (uvSession._bodyObserver) {
        uvSession._bodyObserver.disconnect();
      }
      
      if (uvSession._documentObserver) {
        uvSession._documentObserver.disconnect();
      }
      
      // Clear WebSocket heartbeat
      if (uvSession._websocketHeartbeat) {
        clearInterval(uvSession._websocketHeartbeat);
      }
      
      // Clear visibility interval
      if (uvSession._visibilityInterval) {
        clearInterval(uvSession._visibilityInterval);
      }
      
      // Close any active WebSockets
      activeWebsockets.forEach(ws => {
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.close();
            console.log('Closed WebSocket during cleanup');
          }
        } catch (e) {
          console.warn('Error closing WebSocket:', e);
        }
      });
      
      // Clear the WebSockets set
      activeWebsockets.clear();
      
      // Remove visibility styles if they exist
      if (uvSession._forceAppVisibilityStyle && uvSession._forceAppVisibilityStyle.parentNode) {
        uvSession._forceAppVisibilityStyle.parentNode.removeChild(uvSession._forceAppVisibilityStyle);
      }
      
      // Leave the call before cleaning up containers
      await uvSession.leaveCall();
      
      // Clean up container elements
      if (uvSession._containerElements) {
        // Remove the iframe if it exists
        if (uvSession._containerElements.iframe && uvSession._containerElements.iframe.parentNode) {
          uvSession._containerElements.iframe.parentNode.removeChild(uvSession._containerElements.iframe);
        }
        
        // Remove the outer container
        if (uvSession._containerElements.outerContainer && uvSession._containerElements.outerContainer.parentNode) {
          uvSession._containerElements.outerContainer.parentNode.removeChild(uvSession._containerElements.outerContainer);
        }
      } else {
        // Fallback cleanup
        const container = document.getElementById('ultravox-outer-container');
        if (container) {
          document.body.removeChild(container);
        }
      }
      
      // Restore original service worker
      if (window.navigator._originalServiceWorker) {
        window.navigator.serviceWorker = window.navigator._originalServiceWorker;
      }
      
      // Restore original functions
      restoreInterceptors();
      
      // Reset the session
      uvSession = null;
    } catch (error) {
      console.error('Error cleaning up call:', error);
      
      // Restore original functions even if there was an error
      restoreInterceptors();
      
      // Close any active WebSockets in error case too
      activeWebsockets.forEach(ws => {
        try {
          ws.close();
        } catch (e) {}
      });
      
      // Clear the WebSockets set
      activeWebsockets.clear();
    }
  }

  // Dispatch a custom event when the call ends
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('callEnded');
    window.dispatchEvent(event);
  }

  // Return a resolved promise since this is an async function
  return Promise.resolve();
} 