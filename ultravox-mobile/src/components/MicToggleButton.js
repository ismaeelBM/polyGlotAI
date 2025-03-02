import React, { useState, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { toggleMute } from '../lib/callFunctions';
import { Role } from '../lib/callFunctions';
// In a real app, you'd use a proper icon library like react-native-vector-icons
// For now, we'll just use text representations

const MicToggleButton = ({ role }) => {
  const [isMuted, setIsMuted] = useState(false);

  const toggleMic = useCallback(async () => {
    try {
      toggleMute(role);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error("Error toggling microphone:", error);
    }
  }, [isMuted, role]);

  return (
    <TouchableOpacity
      onPress={toggleMic}
      style={styles.button}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContent}>
        <Text style={styles.icon}>{isMuted ? (role === Role.USER ? "🎤⛔" : "🔊⛔") : (role === Role.USER ? "🎤" : "🔊")}</Text>
        <Text style={styles.buttonText}>{isMuted ? "Unmute" : "Mute"}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    height: 40,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: 'white',
    fontSize: 16,
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  }
});

export default MicToggleButton; 