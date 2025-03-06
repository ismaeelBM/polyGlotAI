import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { startCall, endCall, Role } from '../lib/callFunctions';
import demoConfig from '../lib/demo-config';

const HomeScreen = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [callStatus, setCallStatus] = useState('Inactive');
  const [error, setError] = useState(null);
  const callTimeoutRef = useRef(null);

  // Inject CSS to ensure our UI remains visible
  useEffect(() => {
    // Create a style element to protect our UI
    const styleElement = document.createElement('style');
    styleElement.id = 'ultravox-protection-styles';
    styleElement.innerHTML = `
      /* Reset any potential inherited styles */
      * {
        box-sizing: border-box !important;
      }

      /* Extra protection for Ultravox container and its children */
      #ultravox-outer-container,
      #ultravox-container,
      #ultravox-isolation-frame,
      #ultravox-iframe-container,
      [id*="ultravox"] {
        visibility: hidden !important;
        opacity: 0 !important;
        position: fixed !important;
        top: -10000px !important;
        left: -10000px !important;
        width: 0 !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        min-width: 0 !important;
        max-width: 0 !important;
        pointer-events: none !important;
        z-index: -9999 !important;
        display: none !important;
        overflow: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        transform: scale(0) !important;
        flex: 0 0 0 !important;
        position: absolute !important;
        clip: rect(0, 0, 0, 0) !important;
        clip-path: inset(50%) !important;
      }

      /* Force all Ultravox iframes to be contained */
      iframe[id*="ultravox"],
      iframe[title*="Ultravox"] {
        width: 0 !important;
        height: 0 !important;
        position: absolute !important;
        top: -10000px !important;
        left: -10000px !important;
        border: 0 !important;
        display: none !important;
      }

      /* Ensure our app container stays fixed size */
      #root {
        all: initial !important;
        display: block !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        max-width: 100vw !important;
        max-height: 100vh !important;
        overflow: hidden !important;
        background: #121212 !important;
        z-index: 999999 !important;
      }

      /* Reset any potential flex or grid properties */
      #root * {
        flex: initial !important;
        grid: initial !important;
      }

      /* Conversation container specific constraints */
      #conversationContainer {
        height: auto !important;
        max-height: calc(100vh - 200px) !important;
        overflow-y: auto !important;
        flex: 1 !important;
        position: relative !important;
        transform: none !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Set up a more aggressive watcher to maintain our styles
    const styleWatcher = setInterval(() => {
      if (!document.getElementById('ultravox-protection-styles')) {
        console.log('Protection styles removed, re-adding');
        document.head.appendChild(styleElement.cloneNode(true));
      }
      
      // Extra check to force HomeScreen visibility when call is active
      if (!isCallActive) {
        // Force the container to be hidden more aggressively
        const container = document.getElementById('ultravox-outer-container');
        if (container) {
          Object.assign(container.style, {
            position: 'fixed',
            top: '-9999px',
            left: '-9999px',
            visibility: 'hidden',
            opacity: '0',
            pointerEvents: 'none',
            width: '0',
            height: '0',
            minHeight: '0',
            maxHeight: '0',
            overflow: 'hidden',
            display: 'none',
            margin: '0',
            padding: '0',
            border: 'none',
            transform: 'scale(0)'
          });
        }
        
        // Force the root element to be visible and constrained
        const root = document.getElementById('root');
        if (root) {
          Object.assign(root.style, {
            display: 'block',
            visibility: 'visible',
            opacity: '1',
            zIndex: '2',
            height: '100vh',
            maxHeight: '100vh',
            width: '100vw',
            maxWidth: '100vw',
            overflow: 'hidden',
            position: 'fixed',
            top: '0',
            left: '0',
            margin: '0',
            padding: '0'
          });
        }
      }
    }, 100); // More frequent checks
    
    // Cleanup function
    return () => {
      clearInterval(styleWatcher);
      const protectionStyles = document.getElementById('ultravox-protection-styles');
      if (protectionStyles) {
        document.head.removeChild(protectionStyles);
      }
    };
  }, [isCallActive]);

  // Safety timeout - if no response in 10 seconds, show error and reset
  useEffect(() => {
    if (isLoading) {
      callTimeoutRef.current = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          setError('The conversation is taking too long to start. Please try again.');
        }
      }, 10000);
    }
    
    return () => {
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
      }
    }
  }, [isCallActive, isLoading]);

  const handleStartChat = async () => {
    try {
      // Clear any previous errors
      setError(null);
      setIsLoading(true);
      setCallStatus('Starting conversation...');

      // Only include parameters supported by the Ultravox API
      let callConfig = {
        systemPrompt: demoConfig.callConfig.systemPrompt,
        model: demoConfig.callConfig.model,
        languageHint: demoConfig.callConfig.languageHint,
        voice: demoConfig.callConfig.voice,
        temperature: demoConfig.callConfig.temperature,
        selectedTools: [] // No tools for simple chat
      };

      // Start the call in the current view
      await startCall({
        onStatusChange: handleStatusChange,
        onTranscriptChange: () => {}, // Ignore transcripts
        onDebugMessage: (msg) => console.log('Debug:', msg)
      }, callConfig, true); // Enable debug to see what's happening
    } catch (error) {
      console.error('Failed to start chat:', error);
      setIsLoading(false);
      setIsCallActive(false);
      setError(`Failed to start conversation: ${error.message}`);
      setCallStatus(`Error: ${error.message}`);
      
      // Show an alert to ensure the user knows something went wrong
      Alert.alert(
        'Error Starting Conversation',
        `There was a problem starting the conversation: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleEndChat = async () => {
    try {
      setIsLoading(true);
      setCallStatus('Ending conversation...');
      await endCall();
      setIsCallActive(false);
    } catch (error) {
      console.error('Failed to end chat:', error);
    } finally {
      setIsLoading(false);
      setCallStatus('Inactive');
    }
  };

  const handleStatusChange = (status) => {
    console.log('Call status changed:', status);
    setCallStatus(status);
    
    if (status === 'active') {
      setIsCallActive(true);
      setIsLoading(false);
    } else if (status === 'inactive' || status === 'ended' || status === 'error' || status.startsWith('Error')) {
      setIsCallActive(false);
      setIsLoading(false);
    }
  };

  const handleEmergencyReset = () => {
    setError(null);
    setIsLoading(false);
    setIsCallActive(false);
    setCallStatus('Inactive');
    
    // Additional cleanup if needed
    try {
      endCall().catch(e => console.warn('Error during emergency reset:', e));
    } catch (e) {
      console.warn('Error during emergency reset:', e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.container} id="container">
        <View style={styles.header}>
          <Text style={styles.title}>Voice Assistant</Text>
          <Text style={styles.subtitle}>
            {isCallActive ? "Call is active" : "Ready to start"}
          </Text>
        </View>

        {/* Conversation Area - Complete overhaul */}
        <div 
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '300px',
            height: '200px',
            backgroundColor: '#1E1E1E',
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
          id="conversationContainer"
        >
          <div 
            style={{
              position: 'absolute',
              width: '200px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              padding: 0,
              margin: 0,
              top: '40%',
              transform: 'translateY(-50%)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '200px',
                height: '20px',
                lineHeight: '20px',
                color: '#999',
                fontSize: '16px',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            >
              {isCallActive ? 'Call Active' : 'Start'}
            </div>
          </div>
          
          {isCallActive && (
            <div
              onClick={handleEndChat}
              style={{
                position: 'absolute',
                bottom: '40px',
                width: '120px',
                height: '36px',
                backgroundColor: '#D32F2F',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                userSelect: 'none',
                border: 'none',
                outline: 'none',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              End Call
            </div>
          )}
        </div>

        {/* Remove the old controls section since we have the end button in the container */}
        <View style={styles.controlsContainer} id="controlsContainer">
          {!isCallActive && (
            <TouchableOpacity 
              style={[styles.startButton, isLoading && styles.disabledButton]} 
              onPress={handleStartChat}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.buttonText}>Start Conversation</Text>
              )}
            </TouchableOpacity>
          )}
          
          {error && (
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={handleEmergencyReset}
            >
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  header: {
    paddingVertical: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAA',
  },
  conversationContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '300px',
    height: '200px',
    backgroundColor: '#1E1E1E',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyConversation: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
    overflow: 'hidden',
  },
  emptyConversationText: {
    position: 'absolute',
    width: '200px',
    height: '20px',
    lineHeight: '20px',
    color: '#999',
    fontSize: '16px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    userSelect: 'none',
    pointerEvents: 'none',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#AAA',
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  startButton: {
    backgroundColor: '#0B57D0',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#0B57D0AA',
  },
  endButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  resetButton: {
    backgroundColor: '#E65100',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginLeft: 8,
    width: 100,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen; 