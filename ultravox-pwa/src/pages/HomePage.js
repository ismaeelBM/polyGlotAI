import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import Layout from '../components/Layout';
import CustomButton from '../components/ui/custom-button';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6 flex flex-col items-center justify-center h-full"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <motion.div 
            className="bg-white/10 p-6 rounded-full"
            animate={{ 
              y: [0, -10, 0],
              boxShadow: [
                "0 0 0 rgba(255, 255, 255, 0.4)",
                "0 0 20px rgba(255, 255, 255, 0.2)",
                "0 0 0 rgba(255, 255, 255, 0.4)"
              ]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "loop" 
            }}
          >
            <Globe size={64} className="text-white" />
          </motion.div>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl font-bold mb-4 text-center"
        >
          Welcome to Polyglot
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-white/70 text-center mb-8"
        >
          Your AI language tutor for immersive conversations
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full space-y-4"
        >
          <CustomButton
            className="w-full"
            onClick={() => navigate('/language-selection')}
          >
            Get Started
          </CustomButton>
          
          <CustomButton
            variant="outline"
            className="w-full"
            onClick={() => navigate('/login')}
          >
            Login
          </CustomButton>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default HomePage; 