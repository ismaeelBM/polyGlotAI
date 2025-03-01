import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Audio } from 'expo-av';

export default function RootLayout() {
  // Request audio permissions early
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.requestPermissionsAsync();
        
        // Set up audio mode for both recording and playback
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        
        console.log('Audio permissions and mode set up');
      } catch (error) {
        console.error('Failed to set up audio:', error);
      }
    };
    
    setupAudio();
  }, []);
  
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#333',
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          animation: Platform.OS === 'ios' ? 'default' : 'fade_from_bottom',
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Ultravox Demo',
            headerShown: false,
          }} 
        />
      </Stack>
    </SafeAreaProvider>
  );
}