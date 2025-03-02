// services/UltravoxService.ts
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

type UltravoxState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface CallOptions {
  systemPrompt?: string;
  temperature?: number;
  voice?: string;
  userSpeaksFirst?: boolean;
}

type EventListener = (...args: any[]) => void;

class UltravoxService {
  private socket: WebSocket | null = null;
  private currentRecording: Audio.Recording | null = null;
  private audioPlayer: Audio.Sound | null = null;
  private apiKey: string | null = null;
  private pendingOutput: string = '';
  private currentState: UltravoxState = 'idle';
  private listeners: {
    [key: string]: EventListener[];
  } = {
    state: [],
    output: [],
    error: [],
    ended: []
  };
  
  setApiKey(key: string): void {
    this.apiKey = key;
  }
  
  async createCall(options: CallOptions = {}): Promise<string> {
    try {
      const {
        systemPrompt = 'You are a helpful assistant.',
        temperature = 0.8,
        voice = "Mark",
        userSpeaksFirst = false,
      } = options;
      
      if (!this.apiKey) {
        throw new Error('API key not set');
      }
      
      // Construct request body
      const body: any = {
        systemPrompt,
        temperature,
        medium: {
          serverWebSocket: {
            inputSampleRate: 48000,
            outputSampleRate: 48000,
            clientBufferSizeMs: 30000,
          }
        }
      };
      
      if (voice) {
        body.voice = voice;
      }
      
      if (userSpeaksFirst) {
        body.firstSpeaker = 'FIRST_SPEAKER_AGENT';
      }
      console.log(JSON.stringify(body))
      // Make API call to create a call
      const response = await fetch('http://localhost:6996/api/calls', {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      console.log(JSON.stringify(body))
      console.log(response)
      
      if (!response.ok) {
        throw new Error(`Failed to create call: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(data)
      return data.joinUrl;
    } catch (error) {
      console.error('Error creating call:', error);
      throw error;
    }
  }
  
  async connect(joinUrl: string): Promise<void> {
    // Close existing connection if any
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
    
    // Create new WebSocket connection
    this.socket = new WebSocket(joinUrl);
    
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this._setState('idle');
      this._startAudioStreaming();
    };
    
    this.socket.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const msg = JSON.parse(event.data);
          this._handleDataMessage(msg);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      } else {
        // Binary data - audio playback
        this._handleAudioData(event.data);
      }
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this._emitEvent('error', error);
    };
    
    this.socket.onclose = () => {
      console.log('WebSocket closed');
      this._setState('idle');
      this._stopAudioStreaming();
      this._emitEvent('ended');
    };
  }
  
  async disconnect(): Promise<void> {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    await this._stopAudioStreaming();
  }
  
  private _handleDataMessage(msg: any): void {
    switch (msg.type) {
      case 'playback_clear_buffer':
        this._clearAudioBuffer();
        break;
      case 'state':
        if (msg.state !== this.currentState) {
          this._setState(msg.state as UltravoxState);
        }
        break;
      case 'transcript':
        if (msg.role !== 'agent') return;
        
        if (msg.text) {
          this.pendingOutput = msg.text;
        } else if (msg.delta) {
          this.pendingOutput += msg.delta;
        }
        
        this._emitEvent('output', this.pendingOutput, msg.final);
        
        if (msg.final) {
          this.pendingOutput = '';
        }
        break;
      case 'client_tool_invocation':
        this._handleClientToolCall(msg.toolName, msg.invocationId, msg.parameters);
        break;
      case 'debug':
        console.log('Debug message:', msg.message);
        break;
      default:
        console.warn('Unhandled message type:', msg.type);
    }
  }
  
  private async _handleClientToolCall(toolName: string, invocationId: string, parameters: any): Promise<void> {
    console.log(`Client tool call: ${toolName}`, parameters);
    
    let response: any = {
      type: 'client_tool_result',
      invocationId: invocationId
    };
    
    // Implement your client-side tools here
    // This is just a placeholder example
    if (toolName === 'getAppInfo') {
      response.result = JSON.stringify({
        appName: 'Ultravox Expo Client',
        version: '1.0.0'
      });
    } else {
      response.errorType = 'undefined';
      response.errorMessage = `Unknown tool: ${toolName}`;
    }
    
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(response));
    }
  }
  
  private _setState(state: UltravoxState): void {
    this.currentState = state;
    this._emitEvent('state', state);
  }
  
  private async _startAudioStreaming(): Promise<void> {
    try {
      console.log('Requesting audio permissions...');
      const { granted } = await Audio.requestPermissionsAsync();
      
      if (!granted) {
        throw new Error('Audio recording permissions not granted');
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      // Create and start the recording
      const recording = new Audio.Recording();
      
      // Fixed recording options to include required web property
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 48000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 48000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        }
      });
      
      // Set up recording progress listener to stream chunks
      recording.setProgressUpdateInterval(100); // 100ms chunks
      recording.setOnRecordingStatusUpdate(this._onRecordingStatusUpdate.bind(this));
      

      console.log(this.currentRecording);
      console.log(recording);
      this.currentRecording = recording;
      await recording.startAsync();
      
      console.log('Audio streaming started');
    } catch (error) {
      console.error('Failed to start audio streaming:', error);
      this._emitEvent('error', error);
    }
  }
  
  private async _onRecordingStatusUpdate(status: Audio.RecordingStatus): Promise<void> {
    if (!status.isRecording || !this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }
    
    try {
      // Get the audio data for the new chunk
      // This is a simplified approach - in a real app you'd need
      // to handle streaming chunks of the correct format
      const uri = this.currentRecording!.getURI();
      if (!uri) return;
      
      const info = await FileSystem.getInfoAsync(uri);
      
      if (info.exists) {
        const data = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // Send the audio data to the WebSocket
        this.socket.send(data);
      }
    } catch (error) {
      console.error('Error sending audio chunk:', error);
    }
  }
  
  private async _stopAudioStreaming(): Promise<void> {
    if (this.currentRecording) {
      try {
        await this.currentRecording.stopAndUnloadAsync();
      } catch (error) {
        console.error('Error stopping recording:', error);
      } finally {
        this.currentRecording = null;
      }
    }
  }
  
  private async _handleAudioData(data: ArrayBuffer): Promise<void> {
    try {
      // Convert binary audio data to playable format
      const audioFile = FileSystem.documentDirectory + 'temp_audio.wav';
      const dataBase64 = this._arrayBufferToBase64(data);
      
      await FileSystem.writeAsStringAsync(audioFile, dataBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Create and play the sound
      const { sound } = await Audio.Sound.createAsync({ uri: audioFile });
      await sound.playAsync();
      
      // Clean up sound when done - Fixed to use isLoaded and isPlaying check
      sound.setOnPlaybackStatusUpdate(status => {
        if (!status.isLoaded) return;
        
        if (status.isLoaded && !status.isPlaying && status.positionMillis > 0 && 
            status.positionMillis === status.durationMillis) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }
  
  private _arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return btoa(binary);
  }
  
  private _clearAudioBuffer(): void {
    // Logic to clear audio buffer would go here
    // This is needed for handling interruptions
    console.log('Clearing audio buffer');
  }
  
  // Event handling methods
  on(event: string, callback: EventListener): () => void {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    } else {
      this.listeners[event] = [callback];
    }
    
    // Return function to remove the listener
    return () => {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
      }
    };
  }
  
  private _emitEvent(event: string, ...args: any[]): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }
}

export default new UltravoxService();