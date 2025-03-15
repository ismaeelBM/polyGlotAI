import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import CustomButton from '../components/ui/custom-button';

const NotFoundPage = () => {
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
            animate={{ rotate: [0, 10, -10, 10, 0] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "loop" 
            }}
          >
            <AlertTriangle size={64} className="text-yellow-400" />
          </motion.div>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl font-bold mb-4 text-center"
        >
          Page Not Found
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-white/70 text-center mb-8"
        >
          The page you're looking for doesn't exist or has been moved.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full"
        >
          <CustomButton
            className="w-full"
            onClick={() => navigate('/')}
          >
            Go Home
          </CustomButton>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default NotFoundPage; 