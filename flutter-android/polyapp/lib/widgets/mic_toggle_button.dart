import 'package:flutter/material.dart';
import '../services/ultravox_service.dart';

class MicToggleButton extends StatefulWidget {
  final bool isCallActive;
  
  const MicToggleButton({
    Key? key,
    required this.isCallActive,
  }) : super(key: key);

  @override
  State<MicToggleButton> createState() => _MicToggleButtonState();
}

class _MicToggleButtonState extends State<MicToggleButton> {
  bool _isMuted = false;

  void _toggleMute() async {
    if (!widget.isCallActive) return;
    
    try {
      await UltravoxService.toggleMute(UltravoxService.Role.user);
      setState(() {
        _isMuted = UltravoxService.isMicMuted;
      });
    } catch (error) {
      print('Error toggling mute: $error');
    }
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: widget.isCallActive ? _toggleMute : null,
      child: Container(
        width: 50.0,
        height: 50.0,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: widget.isCallActive
              ? (_isMuted ? const Color(0xFFD32F2F) : const Color(0xFF0B57D0))
              : Colors.grey[700],
        ),
        child: Icon(
          _isMuted ? Icons.mic_off : Icons.mic,
          color: Colors.white,
          size: 24.0,
        ),
      ),
    );
  }
} 