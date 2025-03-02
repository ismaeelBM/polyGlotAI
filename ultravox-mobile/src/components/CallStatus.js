import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CallStatus = ({ status, children }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Call Status</Text>
        <Text style={styles.statusLabel}>
          Status: <Text style={styles.statusValue}>{status}</Text>
        </Text>
      </View>
      
      {/* Optional Children */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderBottomRightRadius: 1,
    padding: 16,
    width: '100%',
  },
  content: {
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: 'white',
  },
  statusLabel: {
    fontSize: 18,
    fontFamily: 'monospace',
    color: '#AAAAAA',
  },
  statusValue: {
    fontSize: 16,
    color: 'white',
  },
});

export default CallStatus; 