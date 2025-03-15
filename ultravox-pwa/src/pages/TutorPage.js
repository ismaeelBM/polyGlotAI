import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Phone, PhoneOff, Settings, AudioLines } from 'lucide-react';
import Layout from '../components/Layout';
import CustomButton from '../components/ui/custom-button';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { startCall, endCall, generateSystemPrompt, Role, toggleMute } from '../services/callService';
import RingingAnimation from '../components/RingingAnimation';
import AudioWave from '../components/AudioWave';
import TranslationDisplay from '../components/TranslationDisplay';

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
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [error, setError] = useState(null);
  
  // For translation display
  const [translationData, setTranslationData] = useState({
    original: "",
    translated: ""
  });
  
  const callSession = useRef(null);
  const startTime = useRef(null);
  const mountedRef = useRef(true);

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

  const handleSelectTutor = (tutor) => {
    setSelectedTutor(tutor);
  };

  const handleStartCall = async () => {
    if (!selectedTutor) return;
    
    setIsConnecting(true);
    setShowRinging(true);
    
    try {
      // Prepare for call
      const systemPrompt = generateSystemPrompt(selectedTutor, null, 1);
      
      // Set up callbacks for the call
      const callbacks = {
        onStatusChange: (status) => {
          if (!mountedRef.current) return;
          
          if (status === 'connected') {
            setIsConnecting(false);
            setIsInCall(true);
            startTime.current = new Date();
          } else if (status === 'disconnected') {
            setIsInCall(false);
            setIsConnecting(false);
          }
        },
        onTranscriptChange: (newTranscripts) => {
          if (!mountedRef.current) return;
          
          // Update translation data with the latest transcript
          if (newTranscripts && newTranscripts.length > 0) {
            const latestTranscript = newTranscripts[newTranscripts.length - 1];
            
            if (latestTranscript.role === Role.AGENT) {
              setIsActiveSpeech(true);
              
              // Simulate translation (in a real app, this would come from a translation service)
              setTranslationData({
                original: latestTranscript.text,
                translated: `Translation of: ${latestTranscript.text}`
              });
              
              // Simulate speech ending after a delay
              setTimeout(() => {
                if (mountedRef.current) {
                  setIsActiveSpeech(false);
                }
              }, latestTranscript.text.length * 100);
            }
          }
        }
      };
      
      // Start the call
      const callConfig = {
        systemPrompt,
        voice: selectedTutor.voice,
        languageHint: selectedTutor.language
      };
      
      callSession.current = await startCall(callbacks, callConfig, false);
      
      // Deduct credits if applicable
      if (deductCredits) {
        deductCredits(1);
      }
      
    } catch (error) {
      console.error('Error starting call:', error);
      setError('Failed to connect. Please try again.');
      setIsConnecting(false);
      setShowRinging(false);
    }
  };

  const handleEndCall = async () => {
    try {
      await endCall();
      
      // Record the conversation if needed
      if (startTime.current && recordConversation) {
        const duration = Math.round((new Date() - startTime.current) / 1000);
        recordConversation(selectedTutor.id, duration);
      }
      
      setIsInCall(false);
      
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const handleToggleMute = () => {
    toggleMute(Role.USER);
    setIsMicMuted(!isMicMuted);
  };

  const handleRingingComplete = () => {
    setShowRinging(false);
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6 relative"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate('/language-selection')}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft size={20} />
          </button>
          
          <h1 className="text-xl font-semibold">Tutor Session</h1>
          
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <Settings size={20} />
          </button>
        </div>
        
        {/* Tutor Profile */}
        <motion.div 
          className="flex flex-col items-center mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: selectedTutor.backgroundColor }}
          >
            <User size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-semibold mb-1">{selectedTutor.name}</h2>
          <p className="text-white/70 mb-2">{selectedTutor.language} Tutor</p>
          <p className="text-sm text-white/50 text-center">{selectedTutor.description}</p>
        </motion.div>
        
        {/* Call Status Area */}
        <motion.div 
          className="bg-[#1a1a1a] rounded-lg p-6 mb-6 flex flex-col items-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {showRinging ? (
            <RingingAnimation onAnimationComplete={handleRingingComplete} />
          ) : isInCall ? (
            <div className="w-full">
              <div className="flex justify-center mb-4">
                <AudioWave isActive={isActiveSpeech} />
              </div>
              <p className="text-center mb-4">
                {isActiveSpeech ? "Tutor is speaking..." : "Listening..."}
              </p>
              
              {/* Display the latest transcript as a translation */}
              {translationData.original && (
                <TranslationDisplay 
                  original={translationData.original} 
                  translated={translationData.translated} 
                />
              )}
              
              <div className="flex justify-center gap-4 mt-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-3 rounded-full ${isMicMuted ? 'bg-red-500' : 'bg-white/10'}`}
                  onClick={handleToggleMute}
                >
                  <AudioLines size={24} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 rounded-full bg-red-500"
                  onClick={handleEndCall}
                >
                  <PhoneOff size={24} />
                </motion.button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-center mb-6">Ready to start your lesson?</p>
              <CustomButton
                onClick={handleStartCall}
                className="w-full"
                isLoading={isConnecting}
              >
                <div className="flex items-center justify-center gap-2">
                  <Phone size={18} />
                  <span>Start Call</span>
                </div>
              </CustomButton>
            </>
          )}
        </motion.div>
        
        {/* Error message if any */}
        {error && (
          <motion.div 
            className="bg-red-500/20 border border-red-500/50 rounded-md p-3 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-sm text-white">{error}</p>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
};

export default TutorPage; 