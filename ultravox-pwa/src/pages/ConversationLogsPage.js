import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageSquareText } from 'lucide-react';
import Layout from '../components/Layout';
import { useProgress } from '../contexts/ProgressContext';
import { useLanguage } from '../contexts/LanguageContext';

const ConversationLogsPage = () => {
  const navigate = useNavigate();
  const { getLanguagesWithLogs } = useProgress();
  const { tutors } = useLanguage();
  
  // Get available languages with logs
  const languagesWithLogs = getLanguagesWithLogs();
  
  // Get the tutor info for each language that has logs
  const languageOptions = languagesWithLogs.map(language => {
    // Find a tutor matching this language
    const tutor = tutors.find(t => t.language === language);
    return {
      id: language,
      name: language,
      backgroundColor: tutor ? tutor.backgroundColor : '#4b5563',
    };
  });
  
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
            onClick={() => navigate('/tutor')}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold ml-2">Conversation Logs</h1>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="p-3 bg-white/10 rounded-full mb-4">
            <MessageSquareText size={24} />
          </div>
          <h2 className="text-xl font-semibold mb-1">Select a Language</h2>
          <p className="text-white/70 text-center">View conversation logs by language</p>
        </motion.div>
        
        {languageOptions.length > 0 ? (
          <div className="space-y-4">
            {languageOptions.map(language => (
              <motion.div
                key={language.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/10 rounded-lg p-4 cursor-pointer"
                onClick={() => navigate(`/conversation-logs/${language.id}`)}
              >
                <div className="flex items-center">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                    style={{ backgroundColor: language.backgroundColor }}
                  >
                    <MessageSquareText size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium">{language.name}</h3>
                    <p className="text-sm text-white/70">View logs</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 rounded-lg p-6 text-center">
            <p className="text-white/70">No conversation logs found</p>
            <p className="text-sm text-white/50 mt-2">
              Start a conversation with a tutor to create logs.
              {process.env.NODE_ENV !== 'production' && (
                <>
                  <br />
                  <br />
                  Tip: Use the "Test: Add Sample Log" button on the tutor page to create sample data.
                </>
              )}
            </p>
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default ConversationLogsPage; 