import React from 'react';
import { motion } from 'framer-motion';

const TranslationDisplay = ({ 
  original = "This is a sample sentence in English.",
  translated = "C'est une phrase d'exemple en français.",
  pronunciation = "Say phra-zuh duh-zahm-pluh ahn frahn-say"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-xs mt-6 p-4 bg-[#1a1a1a] rounded-lg border border-white/10"
    >
      <div className="mb-4">
        <p className="text-xs text-white/60 mb-1">Original</p>
        <p className="text-white text-sm">{original}</p>
      </div>
      
      <div className="pt-3 border-t border-white/10 mb-4">
        <p className="text-xs text-white/60 mb-1">Translation</p>
        <p className="text-green-400 text-sm">{translated}</p>
      </div>

      <div className="pt-3 border-t border-white/10">
        <p className="text-xs text-white/60 mb-1">Pronunciation</p>
        <p className="text-blue-400 text-sm font-italic">{pronunciation}</p>
      </div>
    </motion.div>
  );
};

export default TranslationDisplay; 