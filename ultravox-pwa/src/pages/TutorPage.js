import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Phone, PhoneOff, Settings, AudioLines, MessageSquareText } from 'lucide-react';
import Layout from '../components/Layout';
import CustomButton from '../components/ui/custom-button';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { startCall, endCall, generateSystemPrompt, Role } from '../services/callService';
import { getHighlights, getSummary } from '../services/t2tService';
import RingingAnimation from '../components/RingingAnimation';
import AudioWave from '../components/AudioWave';
import TranslationDisplay from '../components/TranslationDisplay';

const TutorPage = () => {
  const navigate = useNavigate();
  const { selectedTutor, setSelectedTutor, tutors } = useLanguage();
  const { deductCredits } = useAuth();
  const { recordConversation } = useProgress();
  
  const [currentStatus, setCurrentStatus] = useState('idle');
  const [showMenu, setShowMenu] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showRinging, setShowRinging] = useState(false);
  const [isActiveSpeech, setIsActiveSpeech] = useState(false);
  const [error, setError] = useState(null);
  
  // For translation display
  const [translationData, setTranslationData] = useState({
    original: "Hello, how are you doing today?",
    translated: "Bonjour, comment allez-vous aujourd'hui?",
    pronunciation: "bohn-ZHOOR, ko-mahn tah-lay VOO oh-zhoor-DWEE"
  });
  
  const callSession = useRef(null);
  const startTime = useRef(null);
  const mountedRef = useRef(true);
  const summary = useRef(null);

  // If no tutor is selected, show a list of tutors for selection
  const [tutorOptions, setTutorOptions] = useState([]);
  
  // Handle cleanup when component unmounts
  useEffect(() => {
    // If no tutor is selected, prepare tutor options
    if (!selectedTutor) {
      setTutorOptions(tutors);
    }
    
    // Cleanup function
    return () => {
      mountedRef.current = false;
      if (isInCall) {
        handleEndCall();
      }
    };
  }, [selectedTutor, tutors]); // eslint-disable-line react-hooks/exhaustive-deps
  // The above dependency array is intentionally missing handleEndCall and isInCall
  // Adding handleEndCall would cause an infinite loop since it updates state
  // isInCall is only used in the cleanup function which runs once on unmount

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
    
    setShowRinging(true);
    
    try {
      // Prepare for call
      const systemPrompt = generateSystemPrompt(selectedTutor, null, 1);
      
      // Set up callbacks for the call
      const callbacks = {
        onStatusChange: async (status, transcripts) => {
          // Valid Statuses: [idle, listening, speaking, thinking, disconnected, disconnecting, connecting]
          if (currentStatus !== status) {
            console.log('status changed to:', status);
            if (status === 'speaking' || status === 'listening') {
              if (transcripts.length > 1) {
                try {
                  const newTranslations = await getHighlights(transcripts);
                  console.log('newTranslations:', newTranslations);
                  setTranslationData({
                    original: newTranslations.words.original,
                    translated: newTranslations.words.translation,
                    pronunciation: newTranslations.words.pronounciation
                  });
                } catch (error) {
                  console.error('Error getting highlights:', error);
                }
              }
            } else if (status === 'disconnecting') {
              const summaryData = await getSummary(transcripts);
              console.log('summary:', summaryData);
              summary.current = summaryData;
              const duration = Math.round((new Date() - startTime.current) / 1000);
              recordConversation(
                selectedTutor,
                duration,
                transcripts,
                summaryData
              );
            }
          }
          if (status === 'connecting') {
            setIsConnecting(true);
            setIsInCall(false);
            console.log('Connecting...');
          } else if (status === 'idle' || status === 'listening' || status === 'speaking' || status === 'thinking') {
            setIsConnecting(false);
            setIsInCall(true);
            console.log('status changed to:', status);
          } else if (status === 'disconnected') {
            setIsInCall(false);
            setIsConnecting(false);
          }
          setCurrentStatus(status);
        },
        onTranscriptChange: (newTranscripts) => {
          if (!mountedRef.current) return;
          
          // Log full transcript array
          // console.log('Full transcripts:', newTranscripts);
        }
      };
      
      // Simulate connecting to call after ringing animation
      setTimeout(() => {
        handleConnectCall(systemPrompt, callbacks);
      }, 3000);
      
    } catch (error) {
      console.error('Error starting call:', error);
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
      // if (deductCredits) {
      //   deductCredits(1);
      // }

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
    console.log('Ending call');
    try {
      await endCall();
      
      setTimeout(() => {
        setIsInCall(false);
        setIsConnecting(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error ending call:', error);
      setIsConnecting(false);
    }
  };

  // DEBUG ONLY: Simulate a call with sample data (for testing)
  const simulateCall = () => {
    const sampleTranscripts = [
      { speaker: Role.USER, text: "Hello, how are you?", isFinal: true, medium: "audio" },
      { speaker: Role.AGENT, text: "Bonjour! Je vais bien, merci. Et vous?", isFinal: true, medium: "audio" },
      { speaker: Role.USER, text: "I'm good. Can you teach me some French words?", isFinal: true, medium: "audio" },
      { speaker: Role.AGENT, text: "Bien sûr! Let's start with some basic greetings.", isFinal: true, medium: "audio" }
    ];
    
    const sampleSummary = {
      language: selectedTutor.language,
      words: [
        { original: "Bonjour", translation: "Hello", pronunciation: "bohn-ZHOOR" },
        { original: "Je vais bien", translation: "I'm doing well", pronunciation: "zhuh vay bee-YEN" },
        { original: "Et vous", translation: "And you", pronunciation: "ay VOO" }
      ],
      sentences: [
        { original: "Bonjour! Je vais bien, merci. Et vous?", 
          translation: "Hello! I'm doing well, thank you. And you?", 
          pronunciation: "bohn-ZHOOR! zhuh vay bee-YEN, mehr-SEE. ay VOO?" }
      ]
    };
    
    // Record a simulated conversation
    recordConversation(
      selectedTutor,
      5 * 60, // 5 minutes
      sampleTranscripts,
      sampleSummary
    );
    
    console.log('Simulated call recorded');
  };

  const handleRingingComplete = () => {
    setShowRinging(false);
  };

  const handleMenuSelect = (option) => {
    setShowMenu(false);
    // Handle menu option selection
    if (option === 'Conversation Logs') {
      navigate("/conversation-logs");
    } else if (option === 'Settings') {
      navigate("/settings");
    }
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
          {['User Profile', 'Billing', 'Settings', 'Conversation Logs', 'Help'].map((option) => (
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
            
            {isInCall && <TranslationDisplay 
              original={translationData.original} 
              translated={translationData.translated}
              pronunciation={translationData.pronunciation}
            />}
            
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
            
            {/* Test button for debugging - only in development */}
            {process.env.NODE_ENV !== 'production' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-2 w-full max-w-xs"
              >
                <CustomButton
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/50"
                  onClick={simulateCall}
                >
                  <MessageSquareText size={16} className="text-purple-400" />
                  Test: Add Sample Log
                </CustomButton>
              </motion.div>
            )}
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