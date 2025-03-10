import 'package:flutter/material.dart';
import '../services/ultravox_service.dart';
import '../models/demo_config.dart';
import '../widgets/mic_toggle_button.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isCallActive = false;
  bool _isLoading = false;
  String _callStatus = 'Inactive';
  String? _error;

  @override
  void initState() {
    super.initState();
  }

  Future<void> _handleStartChat() async {
    try {
      // Clear any previous errors
      setState(() {
        _error = null;
        _isLoading = true;
        _callStatus = 'Starting conversation...';
      });

      // Get the demo configuration
      final callConfig = DemoConfig.defaultConfig.callConfig;

      // Start the call with status change callback
      await UltravoxService.startCall(
        callConfig,
        _handleStatusChange,
      );
    } catch (error) {
      print('Failed to start chat: $error');
      setState(() {
        _isLoading = false;
        _isCallActive = false;
        _error = 'Failed to start conversation: $error';
        _callStatus = 'Error: $error';
      });

      // Show an alert dialog
      if (mounted) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Error Starting Conversation'),
            content: Text('There was a problem starting the conversation: $error'),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('OK'),
              ),
            ],
          ),
        );
      }
    }
  }

  Future<void> _handleEndChat() async {
    try {
      setState(() {
        _isLoading = true;
        _callStatus = 'Ending conversation...';
      });
      await UltravoxService.endCall();
      setState(() {
        _isCallActive = false;
        _isLoading = false;
        _callStatus = 'Inactive';
      });
    } catch (error) {
      print('Failed to end chat: $error');
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _handleStatusChange(UltravoxService.CallStatus status) {
    print('Call status changed: $status');
    
    setState(() {
      switch (status) {
        case UltravoxService.CallStatus.connecting:
          _isCallActive = false;
          _isLoading = true;
          _callStatus = 'connecting';
          break;
        case UltravoxService.CallStatus.listening:
        case UltravoxService.CallStatus.thinking:
        case UltravoxService.CallStatus.speaking:
          _isCallActive = true;
          _isLoading = false;
          _callStatus = status.toString().split('.').last;
          break;
        case UltravoxService.CallStatus.disconnected:
          _isCallActive = false;
          _isLoading = false;
          _callStatus = 'disconnected';
          break;
        case UltravoxService.CallStatus.error:
          _isCallActive = false;
          _isLoading = false;
          _callStatus = 'error';
          break;
        default:
          _isCallActive = false;
          _isLoading = false;
          _callStatus = 'unknown';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.symmetric(vertical: 16.0),
                margin: const EdgeInsets.only(bottom: 8.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Voice Assistant',
                      style: TextStyle(
                        fontSize: 24.0,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8.0),
                    Text(
                      _isCallActive ? 'Call is active' : 'Ready to start',
                      style: TextStyle(
                        fontSize: 16.0,
                        color: Colors.grey[400],
                      ),
                    ),
                  ],
                ),
              ),

              // Conversation Area
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E1E1E),
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  width: double.infinity,
                  margin: const EdgeInsets.symmetric(vertical: 20.0),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Conversation content
                      Center(
                        child: Text(
                          _isCallActive ? 'Call Active' : 'Start',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 16.0,
                          ),
                        ),
                      ),
                      
                      // End call button (when active)
                      if (_isCallActive)
                        Positioned(
                          bottom: 40.0,
                          child: InkWell(
                            onTap: _handleEndChat,
                            child: Container(
                              width: 120.0,
                              height: 36.0,
                              decoration: BoxDecoration(
                                color: const Color(0xFFD32F2F),
                                borderRadius: BorderRadius.circular(18.0),
                              ),
                              alignment: Alignment.center,
                              child: const Text(
                                'End Call',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 14.0,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),

              // Controls area
              Container(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (!_isCallActive)
                      Expanded(
                        child: InkWell(
                          onTap: _isLoading ? null : _handleStartChat,
                          child: Container(
                            height: 48.0,
                            decoration: BoxDecoration(
                              color: _isLoading
                                  ? const Color(0xFF0B57D0).withOpacity(0.7)
                                  : const Color(0xFF0B57D0),
                              borderRadius: BorderRadius.circular(24.0),
                            ),
                            alignment: Alignment.center,
                            child: _isLoading
                                ? const SizedBox(
                                    width: 20.0,
                                    height: 20.0,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2.0,
                                      valueColor:
                                          AlwaysStoppedAnimation<Color>(Colors.white),
                                    ),
                                  )
                                : const Text(
                                    'Start Conversation',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 16.0,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                          ),
                        ),
                      ),
                    if (_isCallActive)
                      MicToggleButton(isCallActive: _isCallActive),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
} 