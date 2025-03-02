import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Toggle from "./Toggle";

const DebugMessages = ({ debugMessages = [] }) => {
  const [messages, setMessages] = useState([]);
  const [showDebugMessages, setShowDebugMessages] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    setMessages(debugMessages);
  }, [debugMessages]);

  useEffect(() => {
    if (scrollViewRef.current && showDebugMessages) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, showDebugMessages]);

  const handleToggle = () => {
    setShowDebugMessages(!showDebugMessages);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Debug View</Text>
        <Toggle
          id="toggleDebug"
          isOn={showDebugMessages}
          handleToggle={handleToggle}
        />
      </View>

      {showDebugMessages && debugMessages && debugMessages.length > 0 && (
        <View style={styles.messagesContainer}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
          >
            {messages.map((msg, index) => (
              <Text
                key={index}
                style={styles.messageText}
              >
                {msg.message?.message || "Message not available"}
              </Text>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    flexDirection: 'column',
    maxWidth: '100%',
    width: '100%',
    paddingVertical: 20,
    paddingRight: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontFamily: 'monospace',
    marginRight: 16,
    color: 'white',
  },
  messagesContainer: {
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3B3F',
  },
  scrollView: {
    height: 160,
  },
  scrollViewContent: {
    paddingRight: 8,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#EEEEEE',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderStyle: 'dotted',
    borderBottomColor: '#3A3B3F',
  },
});

export default DebugMessages; 