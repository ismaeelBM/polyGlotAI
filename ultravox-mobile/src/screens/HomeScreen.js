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

      // Simplify the call configuration
      const callConfig = {
        systemPrompt: demoConfig.callConfig.systemPrompt,
        model: demoConfig.callConfig.model,
        languageHint: demoConfig.callConfig.languageHint,
        voice: demoConfig.callConfig.voice,
        temperature: demoConfig.callConfig.temperature,
        selectedTools: [] // No tools for simple chat
      };

      // Start the call with cleaner approach
      await startCall({
        onStatusChange: handleStatusChange,
        onTranscriptChange: recordTranscripts, // Ignore transcripts
        onDebugMessage: (msg) => console.log('Debug:', msg)
      }, callConfig);
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

  const recordTranscripts = (transcript) => {
    
  }

  const handleStatusChange = (status, transcript) => {
    // alert("Call status now: " + status.toString());
    console.log('Call status changed:', status);
    setCallStatus(status);
    
    if (status === 'connecting') {
      setIsCallActive(false);
      setIsLoading(true);
    } else if (status === 'idle' || status === 'listening' || status === 'thinking' || status === 'speaking') {
      setIsCallActive(true);
      setIsLoading(false);
    } else if (status.startsWith('disconnect')) {
      console.log('Trascript so far: ', transcript);
      setIsCallActive(false);
      setIsLoading(false);
    } else {
      error.log("Unknown status received: ", status);
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

        {/* Conversation Area - Using React Native components */}
        <View style={styles.conversationContainer}>
          <View style={styles.conversationContent}>
            <Text style={styles.conversationText}>
              {isCallActive ? 'Call Active' : 'Start'}
            </Text>
          </View>
          
          {isCallActive && (
            <TouchableOpacity 
              onPress={handleEndChat}
              style={styles.endCallButton}
            >
              <Text style={styles.endCallButtonText}>End Call</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Controls area */}
        <View style={styles.controlsContainer}>
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
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 20,
  },
  conversationContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  conversationText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
  endCallButton: {
    position: 'absolute',
    bottom: 40,
    width: 120,
    height: 36,
    backgroundColor: '#D32F2F',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endCallButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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