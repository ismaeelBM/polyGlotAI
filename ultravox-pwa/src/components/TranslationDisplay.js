import React from 'react';
import { motion } from 'framer-motion';

const TranslationDisplay = ({ 
  original = "This is a sample sentence in English.",
  translated = "C'est une phrase d'exemple en français."
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 p-4 bg-[#1a1a1a] rounded-lg border border-white/10"
    >
      <div className="mb-4">
        <p className="text-sm text-white/60 mb-1">English</p>
        <p className="text-white text-base">{original}</p>
      </div>
      
      <div className="pt-3 border-t border-white/10">
        <p className="text-sm text-white/60 mb-1">Translation</p>
        <p className="text-green-400 text-base">{translated}</p>
      </div>
    </motion.div>
  );
};

export default TranslationDisplay; 