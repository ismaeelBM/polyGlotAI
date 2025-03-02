import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Toggle switch component for React Native
 */
const Toggle = ({ isOn, handleToggle, onColor = '#000', offColor = '#000', id }) => {
  const [isChecked, setIsChecked] = useState(isOn);

  useEffect(() => {
    setIsChecked(isOn);
  }, [isOn]);

  const toggleSwitch = () => {
    setIsChecked(!isChecked);
    handleToggle();
  };

  return (
    <TouchableOpacity 
      onPress={toggleSwitch}
      style={styles.container}
      activeOpacity={0.8}
    >
      <View 
        style={[
          styles.toggleContainer, 
          { backgroundColor: isChecked ? onColor : offColor }
        ]}
      >
        <View 
          style={[
            styles.toggleCircle,
            isChecked ? styles.toggleCircleOn : styles.toggleCircleOff
          ]} 
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleContainer: {
    width: 40,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    padding: 2,
  },
  toggleCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleCircleOn: {
    backgroundColor: 'white',
    alignSelf: 'flex-end',
  },
  toggleCircleOff: {
    backgroundColor: '#555',
    alignSelf: 'flex-start',
  },
});

export default Toggle; 