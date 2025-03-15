import React from 'react';
import { motion } from 'framer-motion';

const AudioWave = ({ isActive, color = "#4BFAC7" }) => {
  const lines = Array(10).fill(0);
  
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="flex items-center justify-center gap-1 h-12">
        {lines.map((_, index) => (
          <motion.div
            key={index}
            className="w-1 rounded-full"
            style={{ backgroundColor: color }}
            initial={{ height: 5 }}
            animate={{
              height: isActive ? Math.random() * 30 + 5 : 5,
            }}
            transition={{
              duration: 0.3,
              repeat: isActive ? Infinity : 0,
              repeatType: "reverse",
              delay: index * 0.05,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AudioWave; 