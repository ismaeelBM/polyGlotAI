import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Phone, PhoneOff, Settings, AudioLines } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Layout from '../components/Layout';
import CustomButton from '../components/ui/custom-button';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { startCall, endCall, generateSystemPrompt, Role } from '../services/callService';
import RingingAnimation from '../components/RingingAnimation';
import AudioWave from '../components/AudioWave';
import TranslationDisplay from '../components/TranslationDisplay';

// Initialize Google AI with proper configuration
const genAI = new GoogleGenerativeAI("AIzaSyDwjJBeMFvsDPyGmJ47Y_J-_1iT4T8YNow");

const TutorPage = () => {
  const navigate = useNavigate();
  const { selectedTutor, setSelectedTutor, tutors } = useLanguage();
  const { deductCredits } = useAuth();
  const { recordConversation } = useProgress();
  
  const [showMenu, setShowMenu] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showRinging, setShowRinging] = useState(false);
  const [isActiveSpeech, setIsActiveSpeech] = useState(false);
  const [error, setError] = useState(null);
  
  // For translation display
  const [translationData, setTranslationData] = useState({
    original: "Hello, how are you doing today?",
    translated: "Bonjour, comment allez-vous aujourd'hui?"
  });
  
  const callSession = useRef(null);
  const startTime = useRef(null);
  const mountedRef = useRef(true);

  // If no tutor is selected, show a list of tutors for selection
  const [tutorOptions, setTutorOptions] = useState([]);
  
  // Add state for storing all transcripts
  const [transcriptHistory, setTranscriptHistory] = useState([]);
  
  // Handle cleanup when component unmounts
  useEffect(() => {
    // Set mounted ref to true when component mounts
    mountedRef.current = true;
    
    // If no tutor is selected, prepare tutor options
    if (!selectedTutor) {
      setTutorOptions(tutors);
    }
    
    // Cleanup function
    return () => {
      console.log('TutorPage: Component unmounting, cleaning up...');
      if (isInCall) {
        handleEndCall();
      }
      mountedRef.current = false;
    };
  }, []); // Remove dependencies to prevent remounting

  // Simulate tutor speaking when in call
  useEffect(() => {
    if (isInCall) {
      const speakInterval = setInterval(() => {
        setIsActiveSpeech(prev => !prev);
      }, 4000);
      
      return () => clearInterval(speakInterval);
    }
  }, [isInCall]);
  
  const handleSelectTutor = (tutor) => {
    setSelectedTutor(tutor);
  };

  const handleStartCall = async () => {
    if (!selectedTutor) return;
    
    // Reset mounted ref when starting a new call
    mountedRef.current = true;
    setShowRinging(true);
    
    try {
      // Prepare for call
      const systemPrompt = generateSystemPrompt(selectedTutor, null, 1);
      
      // Set up callbacks for the call
      const callbacks = {
        onStatusChange: (status) => {
          if (!mountedRef.current) {
            console.log('TutorPage: Ignoring status change, component unmounted');
            return;
          }
          
          console.log('TutorPage: Status changed to:', status);
          // Valid Statuses: [idle, listening, speaking, thinking, disconnected, disconnecting, connecting]
          
          if (status === 'connecting') {
            setIsConnecting(true);
            setIsInCall(false);
            console.log('TutorPage: Connecting...');
          } else if (status === 'idle' || status === 'listening' || status === 'speaking' || status === 'thinking') {
            setIsConnecting(false);
            setIsInCall(true);
            startTime.current = new Date();
            console.log('TutorPage: Call connected, status:', status);
          } else if (status === 'disconnected') {
            setIsInCall(false);
            setIsConnecting(false);
            console.log('TutorPage: Call disconnected');
          }
        },
        onTranscriptChange: (newTranscripts) => {
          console.log('TutorPage: onTranscriptChange called with:', newTranscripts);
          
          if (!mountedRef.current) {
            console.log('TutorPage: Component unmounted, ignoring transcript update');
            return;
          }
          
          // Ensure newTranscripts is a valid array
          if (Array.isArray(newTranscripts) && newTranscripts.length > 0) {
            console.log('TutorPage: Processing transcript array of length:', newTranscripts.length);
            
            // Process each transcript to ensure it has the required fields
            const validTranscripts = newTranscripts.filter(t => {
              const isValid = t && 
                typeof t === 'object' && 
                typeof t.text === 'string' && 
                (t.speaker === 'agent' || t.speaker === 'user');
              
              if (!isValid) {
                console.log('TutorPage: Invalid transcript found:', t);
              }
              return isValid;
            });
            
            if (validTranscripts.length > 0) {
              console.log('TutorPage: Setting valid transcripts:', validTranscripts);
              setTranscriptHistory(validTranscripts);
              
              // Get the latest transcript
              const latestTranscript = validTranscripts[validTranscripts.length - 1];
              console.log('TutorPage: Processing latest transcript:', latestTranscript);
              
              // Update UI based on latest transcript
              if (latestTranscript.speaker === 'agent') {
                setIsActiveSpeech(true);
                setTranslationData({
                  original: latestTranscript.text,
                  translated: `Translation of: ${latestTranscript.text}`
                });
                
                // Reset active speech after a delay
                const delay = Math.min(latestTranscript.text.length * 100, 5000);
                setTimeout(() => {
                  if (mountedRef.current) {
                    setIsActiveSpeech(false);
                  }
                }, delay);
              } else if (latestTranscript.speaker === 'user') {
                setTranslationData({
                  original: latestTranscript.text,
                  translated: `Translation of user: ${latestTranscript.text}`
                });
              }
            }
          } else {
            console.warn('TutorPage: Received invalid transcripts format:', newTranscripts);
          }
        },
        onDebugMessage: (msg) => {
          console.log('TutorPage: Debug message received:', msg);
        }
      };
      
      // Simulate connecting to call after ringing animation
      setTimeout(() => {
        handleConnectCall(systemPrompt, callbacks);
      }, 3000);
      
    } catch (error) {
      console.error('TutorPage: Error starting call:', error);
      setError('Failed to connect. Please try again.');
      setIsConnecting(false);
      setShowRinging(false);
    }
  };

  const handleConnectCall = async (systemPrompt, callbacks) => {
    setShowRinging(false);
    setIsConnecting(true);
    
    try {
      // Start the call
      const callConfig = {
        systemPrompt,
        voice: selectedTutor.voice
      };
      
      callSession.current = await startCall(callbacks, callConfig, false);
      
      // Deduct credits if applicable
      if (deductCredits) {
        deductCredits(1);
      }

      // Add a fallback in case the onStatusChange callback isn't triggered
      // This ensures the UI transitions even if there's an issue with the call service
      setTimeout(() => {
        if (isConnecting && !isInCall && mountedRef.current) {
          console.log('Fallback: Forcing transition to connected state');
          setIsConnecting(false);
          setIsInCall(true);
          startTime.current = new Date();
        }
      }, 5000); // Wait 5 seconds for the real callback before forcing transition
      
    } catch (error) {
      console.error('Error connecting call:', error);
      setError('Failed to connect. Please try again.');
      setIsConnecting(false);
    }
  };

  const handleEndCall = async () => {
    setIsConnecting(true);
    
    try {
      await endCall();
      
      // Record the conversation if needed
      if (startTime.current && recordConversation) {
        const duration = Math.round((new Date() - startTime.current) / 1000);
        recordConversation(selectedTutor.id, duration);
      }
      
      setTimeout(() => {
        setIsInCall(false);
        setIsConnecting(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error ending call:', error);
      setIsConnecting(false);
    }
  };

  const handleRingingComplete = () => {
    setShowRinging(false);
  };

  const handleMenuSelect = (option) => {
    setShowMenu(false);
    // Handle menu option selection
    navigate("/settings");
  };

  // Add transcript display component
  const TranscriptList = ({ transcripts }) => {
    const listRef = useRef(null);

    useEffect(() => {
      // Auto-scroll to bottom when new transcripts arrive
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }, [transcripts]);

    if (!transcripts || transcripts.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          Start speaking to begin the conversation...
        </div>
      );
    }

    return (
      <div 
        ref={listRef}
        className="flex flex-col gap-4 overflow-y-auto p-4 h-full"
      >
        {transcripts.map((transcript, index) => {
          if (!transcript || !transcript.text) return null;
          
          const isAgent = transcript.speaker === 'agent';
          const messageClasses = isAgent 
            ? "bg-blue-100 ml-auto" 
            : "bg-gray-100 mr-auto";

          return (
            <div 
              key={`${transcript.text}-${index}`}
              className={`max-w-[80%] rounded-lg p-4 ${messageClasses}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">
                  {isAgent ? 'AI Tutor' : 'You'}
                </span>
                {transcript.isFinal && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    Final
                  </span>
                )}
              </div>
              <p className="text-gray-800">{transcript.text}</p>
            </div>
          );
        })}
      </div>
    );
  };

  // Focus Phrase Component
  const FocusPhrase = ({ transcripts }) => {
    const [focusPhrase, setFocusPhrase] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getFocusPhrase = async () => {
      if (!transcripts || transcripts.length === 0) {
        console.log('FocusPhrase: No transcripts available yet');
        return;
      }
      
      try {
        setLoading(true);
        console.log('FocusPhrase: Starting analysis of recent conversation...');
        
        // Get the last few transcripts to analyze
        const recentTranscripts = transcripts.slice(-3).map(t => t.text).join(" ");
        console.log('FocusPhrase: Analyzing transcripts:', recentTranscripts);
        
        // Create prompt for the model
        const prompt = `Based on this conversation excerpt, identify ONE key phrase or word that would be important for a language learner to focus on. Format your response as a JSON object with 'phrase' and 'explanation' fields. Keep the explanation under 50 words.
        
        Conversation: "${recentTranscripts}"`;
        
        console.log('FocusPhrase: Calling Gemini API...');
        
        // Call Google AI with proper configuration
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.0-flash-lite",
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
          }
        });

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        });

        console.log('FocusPhrase: Received response from Gemini API');
        
        const response = result.response;
        const text = response.text();
        console.log('FocusPhrase: Raw API response:', text);
        
        // Clean up the response text - remove markdown formatting
        const cleanJson = text.replace(/```json\n|\n```/g, '').trim();
        console.log('FocusPhrase: Cleaned JSON:', cleanJson);
        
        // Parse the cleaned JSON
        const data = JSON.parse(cleanJson);
        console.log('FocusPhrase: Parsed focus phrase:', data);
        setFocusPhrase(data);
        setError(null);
      } catch (error) {
        console.error('FocusPhrase: Error getting focus phrase:', error);
        setError('Failed to analyze conversation');
      } finally {
        setLoading(false);
      }
    };

    // Update focus phrase every 10 seconds if we have transcripts
    useEffect(() => {
      console.log('FocusPhrase: Setting up interval for analysis');
      if (transcripts && transcripts.length > 0) {
        // Initial analysis
        getFocusPhrase();
        
        // Set up interval with a longer delay to avoid too frequent API calls
        const interval = setInterval(getFocusPhrase, 15000); // Changed to 15 seconds
        return () => {
          console.log('FocusPhrase: Cleaning up interval');
          clearInterval(interval);
        };
      }
    }, [transcripts]);

    // Always render the component container, even if there's no focus phrase yet
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto bg-gray-800/50 rounded-lg p-4 mb-6 border border-white/10"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white">Focus Word/Phrase</h3>
          {loading && (
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white/80 rounded-full"></div>
              <span className="text-xs text-white/70">Analyzing Recent Convo...</span>
            </div>
          )}
        </div>

        {error ? (
          <div className="bg-red-500/20 rounded p-3">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        ) : focusPhrase ? (
          <>
            <div className="bg-white/10 rounded p-3 mb-2 border border-white/20">
              <p className="text-lg font-medium text-white">{focusPhrase.phrase}</p>
            </div>
            <p className="text-sm text-white/70">{focusPhrase.explanation}</p>
          </>
        ) : (
          <div className="bg-white/5 rounded p-3 text-center">
            <p className="text-sm text-white/50">Waiting for conversation to analyze...</p>
          </div>
        )}
      </motion.div>
    );
  };

  // If no tutor is selected, show tutor selection
  if (!selectedTutor) {
    return (
      <Layout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6"
        >
          <div className="flex items-center mb-6">
            <button 
              onClick={() => navigate('/language-selection')}
              className="p-2 rounded-full hover:bg-white/10"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-semibold ml-2">Select a Tutor</h1>
          </div>
          
          <div className="space-y-4">
            {tutorOptions.map(tutor => (
              <motion.div
                key={tutor.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/10 rounded-lg p-4 cursor-pointer"
                onClick={() => handleSelectTutor(tutor)}
              >
                <div className="flex items-center">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                    style={{ backgroundColor: tutor.backgroundColor }}
                  >
                    <User size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium">{tutor.name}</h3>
                    <p className="text-sm text-white/70">{tutor.language} • {tutor.specialty}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/language-selection')}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronLeft size={18} />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Settings size={18} />
        </motion.button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: showMenu ? 1 : 0, y: showMenu ? 0 : -10 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute top-14 right-4 bg-[#1a1a1a] border border-white/20 rounded-md overflow-hidden shadow-lg z-50"
      >
        <div className="py-1">
          {['User Profile', 'Billing', 'Settings', 'Help'].map((option) => (
            <motion.button
              key={option}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              className="px-4 py-2 text-sm text-left w-full hover:bg-white/5"
              onClick={() => handleMenuSelect(option)}
            >
              {option}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="p-6 pt-20 flex flex-col items-center">
        {showRinging ? (
          <RingingAnimation onAnimationComplete={handleRingingComplete} />
        ) : isConnecting ? (
          // Show loading state while connecting
          <div className="flex flex-col items-center justify-center">
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/20 flex items-center justify-center mb-6"
            >
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                <User size={28} className="text-white/80" />
              </div>
            </motion.div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-white/70"
            >
              Connecting...
            </motion.p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 relative ${
                isInCall 
                  ? 'bg-[#1a1a1a] border border-green-500/50' 
                  : 'bg-gradient-to-br from-blue-400/30 to-purple-500/30 border border-white/20'
              }`}
            >
              {isInCall ? (
                <AudioWave isActive={isActiveSpeech} />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                  <User size={28} className="text-white/80" />
                </div>
              )}
              
              {isInCall && (
                <motion.div 
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <AudioLines size={12} />
                  Live
                </motion.div>
              )}
            </motion.div>
            
            {isInCall && <TranscriptList transcripts={transcriptHistory} />}
            
            {isInCall && <FocusPhrase transcripts={transcriptHistory} />}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 w-full max-w-xs"
            >
              {isInCall ? (
                <CustomButton
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 border-red-500/50"
                  onClick={handleEndCall}
                  isLoading={isConnecting}
                >
                  <PhoneOff size={16} className="text-red-400" />
                  End Call
                </CustomButton>
              ) : (
                <CustomButton
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 border-green-500/50"
                  onClick={handleStartCall}
                  isLoading={isConnecting}
                >
                  <Phone size={16} className="text-green-400" />
                  Start Call
                </CustomButton>
              )}
            </motion.div>
          </>
        )}
        
        {/* Error message if any */}
        {error && (
          <motion.div 
            className="mt-4 bg-red-500/20 border border-red-500/50 rounded-md p-3 w-full max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-sm text-white">{error}</p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default TutorPage; 