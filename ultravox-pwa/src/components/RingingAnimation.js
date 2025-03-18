import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import { playRingSound } from '../assets/phone-ring';

const RingingAnimation = ({ onAnimationComplete }) => {
  const audioRef = useRef(null);
  
  useEffect(() => {
    // Try to play sound, but catch any errors silently
    try {
      audioRef.current = playRingSound();
    } catch (err) {
      console.error("Could not play sound:", err);
    }
    
    // Clean up when component unmounts
    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch (err) {
          console.error("Error pausing audio:", err);
        }
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className="relative"
        animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
        transition={{ 
          duration: 1, 
          repeat: 2, 
          repeatType: "loop",
        }}
        onAnimationComplete={() => {
          if (audioRef.current) {
            try {
              audioRef.current.pause();
            } catch (err) {
              console.error("Error pausing audio:", err);
            }
          }
          if (onAnimationComplete) onAnimationComplete();
        }}
      >
        <div className="relative">
          {/* Ripple animations */}
          {[1, 2, 3].map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-2 border-green-400"
              initial={{ opacity: 0.7, scale: 1 }}
              animate={{ opacity: 0, scale: 2 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeOut"
              }}
            />
          ))}
          
          {/* Phone Icon */}
          <motion.div 
            className="bg-green-500 p-4 rounded-full relative z-10"
            whileHover={{ scale: 1.1 }}
          >
            <Phone size={24} className="text-white" />
          </motion.div>
        </div>
      </motion.div>
      <motion.p 
        className="mt-4 text-green-400 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Connecting to tutor...
      </motion.p>
    </div>
  );
};

export default RingingAnimation; 