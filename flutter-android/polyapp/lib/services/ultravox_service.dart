import 'dart:convert';
import 'package:http/http.dart' as http;

class UltravoxService {
  // Change this URL to match your backend server
  static const String backendServerUrl = 'http://localhost:3000';
  
  // Enum for call status, similar to the React Native app
  enum CallStatus {
    inactive,
    connecting,
    listening,
    thinking,
    speaking,
    disconnected,
    error
  }
  
  // Enum for participant roles
  enum Role {
    user,
    agent
  }
  
  // Call session state
  static bool _isSessionActive = false;
  static CallStatus _currentStatus = CallStatus.inactive;
  static String _sessionId = '';
  static bool _isMicMuted = false;
  static bool _isSpeakerMuted = false;
  
  // Getters
  static bool get isSessionActive => _isSessionActive;
  static CallStatus get currentStatus => _currentStatus;
  static bool get isMicMuted => _isMicMuted;
  static bool get isSpeakerMuted => _isSpeakerMuted;
  
  // Create a call via the backend server
  static Future<Map<String, dynamic>> createCall(Map<String, dynamic> callConfig) async {
    try {
      // Extract only the parameters that the Ultravox API endpoint accepts
      final validApiParams = {
        'systemPrompt': callConfig['systemPrompt'],
        'temperature': callConfig['temperature'],
        'model': callConfig['model'],
        'voice': callConfig['voice'],
        'languageHint': callConfig['languageHint'],
        'selectedTools': callConfig['selectedTools'] ?? []
      };
      
      // Use the backend server instead of calling Ultravox API directly
      final response = await http.post(
        Uri.parse('$backendServerUrl/api/ultravox/calls'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode(validApiParams),
      );
      
      if (response.statusCode != 200) {
        throw Exception('HTTP error! Status: ${response.statusCode}, message: ${response.body}');
      }
      
      final data = jsonDecode(response.body);
      _sessionId = data['callId'] ?? '';
      return data;
    } catch (error) {
      print('Error creating call: $error');
      throw error;
    }
  }
  
  // Start a call session with the specified configuration
  static Future<bool> startCall(
    Map<String, dynamic> callConfig,
    Function(CallStatus) onStatusChange
  ) async {
    try {
      // Create the call via our backend to get a join URL
      final callData = await createCall(callConfig);
      
      // Set up connection to the call using the join URL
      // In a real app, we would need to use WebSockets or the ultravox SDK 
      // For this demo, we'll simulate the connection
      _isSessionActive = true;
      _currentStatus = CallStatus.connecting;
      onStatusChange(CallStatus.connecting);
      
      // Simulate connecting to the call
      await Future.delayed(const Duration(seconds: 2));
      
      // Simulate successful connection
      _currentStatus = CallStatus.listening;
      onStatusChange(CallStatus.listening);
      
      return true;
    } catch (error) {
      print('Error starting call: $error');
      _currentStatus = CallStatus.error;
      onStatusChange(CallStatus.error);
      _isSessionActive = false;
      throw error;
    }
  }
  
  // End the current call session
  static Future<bool> endCall() async {
    try {
      if (_isSessionActive) {
        // In a real app, we would make an API call to end the session
        // For this demo, we'll simulate ending the call
        await Future.delayed(const Duration(milliseconds: 500));
        
        _isSessionActive = false;
        _currentStatus = CallStatus.inactive;
        _sessionId = '';
        _isMicMuted = false;
        _isSpeakerMuted = false;
      }
      
      return true;
    } catch (error) {
      print('Error ending call: $error');
      throw error;
    }
  }
  
  // Toggle mute state for either user (mic) or agent (speaker)
  static Future<bool> toggleMute(Role role) async {
    try {
      if (_isSessionActive) {
        // Toggle user microphone
        if (role == Role.user) {
          _isMicMuted = !_isMicMuted;
          // In a real app, we would make an API call to mute/unmute the mic
        } 
        // Toggle agent speaker
        else {
          _isSpeakerMuted = !_isSpeakerMuted;
          // In a real app, we would make an API call to mute/unmute the speaker
        }
        return true;
      } else {
        throw Exception('Session is not active');
      }
    } catch (error) {
      print('Error toggling mute: $error');
      throw error;
    }
  }
} 