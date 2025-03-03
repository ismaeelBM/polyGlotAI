import React, { useState, useCallback, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { toggleMute } from '../lib/callFunctions';
import { Role } from '../lib/callFunctions';
// In a real app, you'd use a proper icon library like react-native-vector-icons
// For now, we'll just use text representations

const MicToggleButton = ({ role, disabled = false }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Reset mute state when component mounts
  useEffect(() => {
    setIsMuted(false);
  }, []);

  const toggleMic = useCallback(async () => {
    if (disabled || isToggling) return;
    
    try {
      setIsToggling(true);
      toggleMute(role);
      setIsMuted(!isMuted);
      // Add a small delay to prevent rapid toggling
      setTimeout(() => {
        setIsToggling(false);
      }, 300);
    } catch (error) {
      console.error("Error toggling microphone:", error);
      setIsToggling(false);
    }
  }, [isMuted, role, disabled, isToggling]);

  return (
    <TouchableOpacity
      onPress={toggleMic}
      style={[
        styles.button, 
        disabled && styles.buttonDisabled,
        isToggling && styles.buttonToggling
      ]}
      activeOpacity={0.7}
      disabled={disabled || isToggling}
    >
      <View style={styles.buttonContent}>
        {isToggling ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Text style={styles.icon}>
              {isMuted ? 
                (role === Role.USER || role === 'user' ? "🎤⛔" : "🔊⛔") : 
                (role === Role.USER || role === 'user' ? "🎤" : "🔊")
              }
            </Text>
            <Text style={styles.buttonText}>{isMuted ? "Unmute" : "Mute"}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    height: 48,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  buttonDisabled: {
    borderColor: '#555',
    opacity: 0.7,
  },
  buttonToggling: {
    borderColor: '#0B57D0',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 20,
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