import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native';
import { startCall, endCall, Role } from '../lib/callFunctions';
import demoConfig from '../lib/demo-config';
import CallStatus from '../components/CallStatus';
import DebugMessages from '../components/DebugMessages';
import MicToggleButton from '../components/MicToggleButton';
import OrderDetails from '../components/OrderDetails';

// Ultravox logo placeholder - in a real app, you'd use a proper image
const UVLogo = () => (
  <View style={styles.logoContainer}>
    <Text style={styles.logo}>ULTRAVOX</Text>
  </View>
);

const HomeScreen = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [agentStatus, setAgentStatus] = useState('off');
  const [callTranscript, setCallTranscript] = useState([]);
  const [callDebugMessages, setCallDebugMessages] = useState([]);
  const [showUserTranscripts, setShowUserTranscripts] = useState(true);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [callTranscript]);

  const handleStatusChange = useCallback((status) => {
    if (status) {
      setAgentStatus(status);
    } else {
      setAgentStatus('off');
    }
  }, []);

  const handleTranscriptChange = useCallback((transcripts) => {
    if (transcripts) {
      setCallTranscript([...transcripts]);
    }
  }, []);

  const handleDebugMessage = useCallback((debugMessage) => {
    setCallDebugMessages(prevMessages => [...prevMessages, debugMessage]);
  }, []);

  const handleStartCallButtonClick = async (showDebugMessages = true) => {
    try {
      handleStatusChange('Starting call...');
      setCallTranscript([]);
      setCallDebugMessages([]);

      // Setup our call config
      let callConfig = {
        systemPrompt: demoConfig.callConfig.systemPrompt,
        model: demoConfig.callConfig.model,
        languageHint: demoConfig.callConfig.languageHint,
        voice: demoConfig.callConfig.voice,
        temperature: demoConfig.callConfig.temperature,
        selectedTools: demoConfig.callConfig.selectedTools,
      };

      await startCall({
        onStatusChange: handleStatusChange,
        onTranscriptChange: handleTranscriptChange,
        onDebugMessage: handleDebugMessage
      }, callConfig, showDebugMessages);

      setIsCallActive(true);
      handleStatusChange('Call started successfully');
    } catch (error) {
      handleStatusChange(`Error starting call: ${error.message}`);
    }
  };

  const handleEndCallButtonClick = async () => {
    try {
      handleStatusChange('Ending call...');
      await endCall();
      setIsCallActive(false);
      handleStatusChange('Call ended successfully');
    } catch (error) {
      handleStatusChange(`Error ending call: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.container}>
        <View style={styles.header}>
          <UVLogo />
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Get In Touch</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.actionArea}>
            <Text style={styles.title}>{demoConfig.title}</Text>
            <View style={styles.contentArea}>
              <View style={styles.logoArea}>
                <UVLogo />
              </View>
              
              {isCallActive ? (
                <View style={styles.callArea}>
                  <View style={styles.transcriptContainer}>
                    <ScrollView
                      ref={scrollViewRef}
                      style={styles.transcriptScroll}
                      contentContainerStyle={styles.transcriptContent}
                    >
                      {callTranscript && callTranscript.map((transcript, index) => (
                        <View key={index}>
                          {showUserTranscripts || transcript.speaker === 'agent' ? (
                            <>
                              <Text style={styles.speakerLabel}>
                                {transcript.speaker === 'agent' ? "Ultravox" : "User"}
                              </Text>
                              <Text style={styles.transcriptText}>
                                {transcript.text}
                              </Text>
                            </>
                          ) : null}
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                  
                  <View style={styles.controlsContainer}>
                    <MicToggleButton role={Role.USER} />
                    <TouchableOpacity
                      style={styles.endCallButton}
                      onPress={handleEndCallButtonClick}
                      disabled={!isCallActive}
                    >
                      <Text style={styles.endCallButtonText}>📞 End Call</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.startCallContainer}>
                  <Text style={styles.overviewText}>
                    {demoConfig.overview}
                  </Text>
                  <TouchableOpacity
                    style={styles.startCallButton}
                    onPress={() => handleStartCallButtonClick(true)}
                  >
                    <Text style={styles.startCallButtonText}>Start Call</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <CallStatus status={agentStatus}>
            <OrderDetails />
          </CallStatus>
        </View>

        <DebugMessages debugMessages={callDebugMessages} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  contactButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 3,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
  },
  mainContent: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 3,
    padding: 16,
  },
  actionArea: {
    flex: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 75,
    height: 75,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: 'white',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  logo: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
  },
  callArea: {
    flex: 1,
  },
  transcriptContainer: {
    flex: 1,
    marginBottom: 20,
    position: 'relative',
  },
  transcriptScroll: {
    flex: 1,
    backgroundColor: '#121212',
    borderRadius: 4,
    padding: 10,
  },
  transcriptContent: {
    paddingBottom: 16,
  },
  speakerLabel: {
    color: '#999999',
    fontSize: 14,
    marginTop: 8,
  },
  transcriptText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 16,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  endCallButton: {
    flex: 1,
    height: 40,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  endCallButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  startCallContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    padding: 16,
  },
  overviewText: {
    color: '#AAAAAA',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  startCallButton: {
    padding: 12,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
  },
  startCallButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HomeScreen; 