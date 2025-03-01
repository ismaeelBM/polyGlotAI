import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Stack } from 'expo-router';
import UltravoxService from '../services/UltravoxService';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function UltravoxScreen() {
  const [apiKey, setApiKey] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are a helpful AI assistant. You provide clear, concise responses to the user\'s questions.'
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentState, setCurrentState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [pendingAgentResponse, setPendingAgentResponse] = useState('');
  
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Set up event listeners for the Ultravox service
  useEffect(() => {
    const stateListener = UltravoxService.on('state', (state) => {
      setCurrentState(state);
      console.log('State changed:', state);
    });
    
    const outputListener = UltravoxService.on('output', (text, isFinal) => {
      if (isFinal) {
        // Add completed message to the list
        setMessages(prev => [...prev, { role: 'assistant', content: text }]);
        setPendingAgentResponse('');
      } else {
        // Update pending message
        setPendingAgentResponse(text);
      }
    });
    
    const errorListener = UltravoxService.on('error', (error) => {
      console.error('Ultravox error:', error);
      Alert.alert('Connection Error', error.message || 'Failed to connect to voice service');
      setIsConnecting(false);
      setIsConnected(false);
    });
    
    const endedListener = UltravoxService.on('ended', () => {
      console.log('Session ended');
      setIsConnected(false);
      setIsConnecting(false);
      addSystemMessage('Session ended');
    });
    
    // Cleanup listeners
    return () => {
      stateListener();
      outputListener();
      errorListener();
      endedListener();
    };
  }, []);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, pendingAgentResponse]);
  
  const addSystemMessage = (content: string) => {
    setMessages(prev => [...prev, { role: 'system', content }]);
  };
  
  const handleConnect = async () => {
    if (!apiKey.trim()) {
      Alert.alert('API Key Required', 'Please enter your Ultravox API key');
      return;
    }
    
    try {
      setIsConnecting(true);
      addSystemMessage('Connecting to voice service...');
      
      // Set the API key
      UltravoxService.setApiKey(apiKey);
      
      // Create a new call
      const joinUrl = await UltravoxService.createCall({
        systemPrompt,
        temperature: 0.8,
        userSpeaksFirst: true,
      });
      
      // Connect to the call
      await UltravoxService.connect(joinUrl);
      
      setIsConnected(true);
      addSystemMessage('Connected. You can now speak to the assistant.');
    } catch (error: any) {
      console.error('Connection error:', error);
      addSystemMessage(`Connection failed: ${error.message}`);
      Alert.alert('Connection Error', error.message || 'Failed to connect to voice service');
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleDisconnect = async () => {
    try {
      await UltravoxService.disconnect();
      setIsConnected(false);
      addSystemMessage('Disconnected from voice service');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };
  
  const renderStateIndicator = () => {
    let color = '#888';
    let label = 'Disconnected';
    
    if (isConnected) {
      switch (currentState) {
        case 'listening':
          color = '#4CAF50'; // Green
          label = 'Listening';
          break;
        case 'thinking':
          color = '#FFC107'; // Yellow
          label = 'Thinking';
          break;
        case 'speaking':
          color = '#2196F3'; // Blue
          label = 'Speaking';
          break;
        default:
          color = '#9E9E9E'; // Gray
          label = 'Idle';
      }
    }
    
    return (
      <View style={styles.stateContainer}>
        <View style={[styles.stateIndicator, { backgroundColor: color }]} />
        <Text style={styles.stateText}>{label}</Text>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <Stack.Screen 
        options={{
          title: 'Ultravox Voice Assistant',
          headerRight: () => renderStateIndicator(),
        }}
      />
      <StatusBar style="auto" />
      
      <KeyboardAvoidingView 
        style={styles.mainContent}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {!isConnected && (
          <View style={styles.setupContainer}>
            <Text style={styles.label}>API Key:</Text>
            <TextInput
              style={styles.apiKeyInput}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="Enter your Ultravox API key"
              secureTextEntry
              placeholderTextColor="#999"
            />
            
            <Text style={styles.label}>System Prompt:</Text>
            <TextInput
              style={styles.promptInput}
              value={systemPrompt}
              onChangeText={setSystemPrompt}
              placeholder="Enter system prompt..."
              multiline
              placeholderTextColor="#999"
            />
            
            <TouchableOpacity 
              style={styles.connectButton}
              onPress={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.connectButtonText}>Connect</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        
        <ScrollView 
          style={styles.messagesContainer}
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((msg, index) => (
            <View 
              key={index} 
              style={[
                styles.messageBubble, 
                msg.role === 'user' ? styles.userMessage : 
                msg.role === 'assistant' ? styles.assistantMessage : 
                styles.systemMessage
              ]}
            >
              <Text 
                style={[
                  styles.messageText,
                  msg.role === 'system' && styles.systemMessageText
                ]}
              >
                {msg.content}
              </Text>
            </View>
          ))}
          
          {/* Show pending assistant response if any */}
          {pendingAgentResponse && (
            <View style={[styles.messageBubble, styles.assistantMessage, styles.pendingMessage]}>
              <Text style={styles.messageText}>{pendingAgentResponse}</Text>
            </View>
          )}
        </ScrollView>
        
        {isConnected && (
          <BlurView intensity={80} tint="light" style={styles.controlsContainer}>
            <View style={styles.stateIndicatorLarge}>
              <View style={[
                styles.stateIndicatorDot, 
                {
                  backgroundColor: 
                    currentState === 'listening' ? '#4CAF50' : 
                    currentState === 'thinking' ? '#FFC107' : 
                    currentState === 'speaking' ? '#2196F3' : 
                    '#9E9E9E'
                }
              ]} />
              <Text style={styles.stateIndicatorText}>
                {currentState === 'listening' ? 'Listening...' : 
                 currentState === 'thinking' ? 'Thinking...' : 
                 currentState === 'speaking' ? 'Speaking...' : 
                 'Ready'}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={handleDisconnect}
            >
              <Ionicons name="close-circle" size={24} color="white" />
              <Text style={styles.disconnectButtonText}>End Call</Text>
            </TouchableOpacity>
          </BlurView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mainContent: {
    flex: 1,
  },
  setupContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  apiKeyInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  promptInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    marginBottom: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  connectButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  stateIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  stateText: {
    fontSize: 14,
    color: '#666',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 100, // Extra space at bottom
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#e3f2fd',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  systemMessage: {
    backgroundColor: '#f1f1f1',
    alignSelf: 'center',
    borderRadius: 8,
    maxWidth: '90%',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  systemMessageText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  pendingMessage: {
    opacity: 0.7,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  stateIndicatorLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  stateIndicatorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
  },
  stateIndicatorText: {
    fontSize: 16,
    fontWeight: '500',
  },
  disconnectButton: {
    backgroundColor: '#e53935',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  disconnectButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
});