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
      /* Keep our app container always visible */
      #root, body, html {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        height: 100% !important;
        width: 100% !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        z-index: 9999 !important;
        background-color: #121212 !important;
      }
      
      /* Ensure our app UI gets priority */
      .container, .safeArea, .conversationContainer, .header, .controlsContainer {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        z-index: 9999 !important;
      }
      
      /* Hide any foreign elements that might be inserted */
      body > *:not(#root):not(#ultravox-outer-container):not(script):not(style) {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        max-height: 0 !important;
        max-width: 0 !important;
        overflow: hidden !important;
      }
      
      /* Extra protection for Ultravox container */
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
        display: block !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Set up a watcher to make sure the styles don't get removed
    const styleWatcher = setInterval(() => {
      if (!document.getElementById('ultravox-protection-styles')) {
        console.log('Protection styles removed, re-adding');
        document.head.appendChild(styleElement.cloneNode(true));
      }
      
      // Extra check to force HomeScreen visibility when call is active
      if (isCallActive) {
        // Force the container to be hidden
        const container = document.getElementById('ultravox-outer-container');
        if (container) {
          container.style.position = 'fixed';
          container.style.top = '-10000px';
          container.style.left = '-10000px';
          container.style.visibility = 'hidden';
          container.style.opacity = '0';
          container.style.pointerEvents = 'none';
        }
        
        // Force the root element to be visible
        const root = document.getElementById('root');
        if (root) {
          root.style.display = 'block';
          root.style.visibility = 'visible';
          root.style.opacity = '1';
          root.style.zIndex = '9999';
        }
      }
    }, 500);
    
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

        {/* Conversation Area */}
        <View style={styles.conversationContainer} id="conversationContainer">
          <View style={styles.emptyConversation}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0B57D0" />
                <Text style={styles.loadingText}>
                  {callStatus || 'Starting conversation...'}
                </Text>
              </View>
            ) : (
              <Text style={styles.emptyConversationText}>
                Start a conversation to begin chatting
              </Text>
            )}
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer} id="controlsContainer">
          <TouchableOpacity 
            style={[
              isCallActive ? styles.endButton : styles.startButton, 
              isLoading && styles.disabledButton
            ]} 
            onPress={isCallActive ? handleEndChat : handleStartChat}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.buttonText}>
                {isCallActive ? "End Conversation" : "Start Conversation"}
              </Text>
            )}
          </TouchableOpacity>
          
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
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    marginVertical: 16,
    overflow: 'hidden',
  },
  emptyConversation: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyConversationText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
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