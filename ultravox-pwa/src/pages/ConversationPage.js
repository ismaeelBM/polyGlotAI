import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { startCall, endCall, generateSystemPrompt, Role, toggleMute } from '../services/callService';

const ConversationPage = () => {
  const { selectedTutor, selectedScenario, difficultyLevel, clearSelections } = useLanguage();
  const { user, deductCredits } = useAuth();
  const { recordConversation } = useProgress();
  const navigate = useNavigate();
  
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [callStatus, setCallStatus] = useState('Initializing');
  const [transcripts, setTranscripts] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [debugMessages, setDebugMessages] = useState([]);
  
  const callSession = useRef(null);
  const startTime = useRef(null);
  const conversationContainerRef = useRef(null);
  const mountedRef = useRef(true);
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (callSession.current) {
        endCall();
        callSession.current = null;
      }
    };
  }, []);
  
  // Redirect if missing required data
  useEffect(() => {
    if (!selectedTutor || !selectedScenario) {
      navigate('/tutors');
    }
  }, [selectedTutor, selectedScenario, navigate]);
  
  // Handle status change callback
  const handleStatusChange = useCallback((status, transcripts) => {
    // console.log('Call status changed:', status);
    if (callStatus !== status) {
      console.log('Call status changed from', callStatus, 'to', status);
      setCallStatus(status || 'unknown');
      if (status === 'connected') {
        setIsCallActive(true);
        setIsLoading(false);
        startTime.current = new Date();
      } else if (status === 'speaking' || status === 'listening') {
        getCurrentSentence(transcripts);
      } else if (status === 'disconnected' || status === 'disconnecting' || status === 'ended' || status === 'error') {
        setIsCallActive(false);
        processTranscripts(transcripts);
      }
    }
  }, []);

  const getCurrentSentence = useCallback((transcripts) => {
    // TODO: Implement this
    console.log('WIP: getCurrentSentence');
  }, []);

  const processTranscripts = useCallback((transcripts) => {
    console.log('Processing transcripts:', transcripts);
    // print the transcripts as strings
    console.log('Transcripts:', transcripts.map(t => t.text).join('\n'));
  }, []);
  
  // Handle transcript change callback
  const handleTranscriptChange = useCallback((newTranscripts) => {
    // console.log('Transcripts updated:', newTranscripts);
    if (Array.isArray(newTranscripts)) {
      setTranscripts(newTranscripts);
    }
  }, []);
  
  // Handle debug messages
  const handleDebugMessage = useCallback((message) => {
    console.log('Debug message:', message);
    setDebugMessages(prev => [...prev, message]);
  }, []);
  
  // Start call when component mounts
  useEffect(() => {
    if (selectedTutor && selectedScenario) {
      startConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]); // Only depends on retryCount to allow manual retries
  
  // Scroll to bottom when transcripts update
  useEffect(() => {
    if (conversationContainerRef.current) {
      conversationContainerRef.current.scrollTop = conversationContainerRef.current.scrollHeight;
    }
  }, [transcripts]);
  
  // Helper function to extract base language from complex language strings
  const extractBaseLanguage = (languageString) => {
    // Extract just the base language (e.g., "English (Indian)" -> "en")
    const baseLanguageMap = {
      "English": "en",
      "French": "fr",
      "Spanish": "es",
      "Italian": "it",
      "Japanese": "ja",
      "Portuguese": "pt",
      "Arabic": "ar"
    };
    
    // Get the first word (base language)
    const baseLanguage = languageString.split(' ')[0].split('(')[0].trim();
    return baseLanguageMap[baseLanguage] || baseLanguage.toLowerCase();
  };
  
  const startConversation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setDebugMessages([]);
      
      // Generate system prompt based on selected options
      const systemPrompt = generateSystemPrompt(selectedTutor, selectedScenario, difficultyLevel);
      
      // Extract base language for the languageHint parameter
      const languageHint = extractBaseLanguage(selectedTutor.language);
      
      // Configure call
      const callConfig = {
        systemPrompt,
        model: "fixie-ai/ultravox-70B", // Ultravox model
        languageHint,
        voice: selectedTutor.voice,
        temperature: 0.4
      };
      
      // Log the call config for debugging
      console.log("Starting call with config:", callConfig);
      
      // Set up callbacks
      const callbacks = {
        onStatusChange: handleStatusChange,
        onTranscriptChange: handleTranscriptChange,
        onDebugMessage: handleDebugMessage
      };
      
      // Start the call
      try {
        const session = await startCall(callbacks, callConfig, true);
        callSession.current = session;
      } catch (error) {
        console.error('Error in startCall:', error);
        setError(`Failed to start call: ${error.message || 'Unknown error'}`);
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      let errorMessage = 'Failed to start conversation. Please try again.';
      
      // Extract more specific error message if available
      if (error && error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };
  
  const handleEndConversation = async () => {
    console.log('Ending conversation');
    
    try {
      // Calculate conversation duration before ending call
      let duration = 0;
      if (startTime.current) {
        const endTime = new Date();
        duration = Math.ceil((endTime - startTime.current) / 60000); // Convert to minutes and round up
      }
      
      // End the call
      await endCall();
      callSession.current = null;
      
      // Update user credits
      if (user && duration > 0) {
        await deductCredits(duration);
        
        // Record conversation in progress
        recordConversation(duration, 5); // Assuming 5 new words learned
      }
      
      // Clear selections and navigate back
      clearSelections();
      navigate('/tutors');
      
    } catch (error) {
      console.error('Error ending conversation:', error);
      setError('Failed to end conversation properly.');
    }
  };
  
  const handleSendMessage = () => {
    if (!message.trim() || !callSession.current || !isCallActive) return;
    
    try {
      // Send message to call session
      callSession.current.sendText(message);
      
      // Clear input
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError(`Failed to send message: ${error.message || 'Unknown error'}`);
    }
  };
  
  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  // Get initials for fallback
  const getInitials = () => {
    return selectedTutor ? selectedTutor.name.charAt(0) : '';
  };
  
  const handleGoBack = () => {
    clearSelections();
    navigate('/tutors');
  };
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };
  
  const handleToggleMute = () => {
    if (callSession.current && isCallActive) {
      toggleMute(Role.USER);
      setIsMicMuted(!isMicMuted);
    }
  };
  
  if (!selectedTutor || !selectedScenario) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="text-2xl font-bold text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }
  
  // Show error screen if there was an error starting the conversation
  if (error && !isCallActive) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-md w-full p-6">
          <div className="flex items-center mb-6">
            <div 
              className="w-12 h-12 rounded-full overflow-hidden mr-3 flex items-center justify-center" 
              style={{ backgroundColor: selectedTutor.backgroundColor }}
            >
              {imageError ? (
                <span className="text-white text-xl font-bold">{getInitials()}</span>
              ) : (
                <img 
                  src={selectedTutor.avatar} 
                  alt={selectedTutor.name} 
                  className="w-full h-full object-cover" 
                  onError={handleImageError}
                />
              )}
            </div>
            <div>
              <h2 className="font-bold">{selectedTutor.name}</h2>
              <div className="text-sm text-gray-600">{selectedTutor.language} Tutor</div>
            </div>
          </div>
          
          <div className="text-center mb-6">
            <div className="text-xl font-bold text-red-600 mb-2">Failed to start conversation</div>
            <div className="text-gray-700 mb-4">{error}</div>
            
            {/* Display debug info in development */}
            {process.env.NODE_ENV === 'development' && debugMessages.length > 0 && (
              <div className="mt-4 p-2 bg-gray-100 rounded text-left">
                <h4 className="font-bold mb-2 text-sm">Debug Messages:</h4>
                <pre className="text-xs overflow-auto max-h-40">
                  {debugMessages.map((msg, i) => (
                    <div key={i} className="mb-1">
                      {JSON.stringify(msg)}
                    </div>
                  ))}
                </pre>
              </div>
            )}
          </div>
          
          <div className="flex flex-col space-y-3">
            <button
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition touch-target"
              onClick={handleRetry}
            >
              Try Again
            </button>
            
            <button
              className="w-full py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition touch-target"
              onClick={handleGoBack}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-full overflow-hidden mr-3 flex items-center justify-center" 
            style={{ backgroundColor: selectedTutor.backgroundColor }}
          >
            {imageError ? (
              <span className="text-white text-lg font-bold">{getInitials()}</span>
            ) : (
              <img 
                src={selectedTutor.avatar} 
                alt={selectedTutor.name} 
                className="w-full h-full object-cover" 
                onError={handleImageError}
              />
            )}
          </div>
          <div>
            <div className="font-bold">{selectedTutor.name}</div>
            <div className="text-xs text-gray-500">{callStatus}</div>
          </div>
        </div>
        
        <button 
          className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm touch-target"
          onClick={handleEndConversation}
        >
          End Call
        </button>
      </div>
      
      {/* Conversation Area */}
      <div 
        ref={conversationContainerRef}
        className="flex-1 p-4 overflow-y-auto no-scrollbar"
      >
        {isLoading && (
          <div className="flex justify-center my-8">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-200 rounded-full mb-2"></div>
              <div className="text-gray-500">Connecting...</div>
            </div>
          </div>
        )}
        
        {error && isCallActive && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          {transcripts.map((item, index) => (
            <div 
              key={index} 
              className={`flex ${item.role === Role.USER ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  item.role === Role.USER 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white shadow rounded-bl-none'
                }`}
              >
                {item.text}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Input Area */}
      <div className="bg-white border-t p-3">
        <div className="flex items-center">
          <button 
            className={`touch-target p-2 ${isMicMuted ? 'text-red-500' : 'text-gray-600'} mr-2 flex items-center justify-center`}
            onClick={handleToggleMute}
            disabled={!isCallActive}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 h-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!isCallActive || isLoading}
          />
          
          <button 
            className="touch-target ml-2 bg-blue-600 text-white rounded-full p-2 flex items-center justify-center"
            onClick={handleSendMessage}
            disabled={!isCallActive || isLoading || !message.trim()}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage; 