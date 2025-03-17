import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, MessageSquareText, BookText, FileText } from 'lucide-react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageLogsPage = () => {
  const navigate = useNavigate();
  const { languageId } = useParams();
  const { tutors } = useLanguage();
  
  // Find the tutor matching this language
  const tutor = tutors.find(t => t.language === languageId);
  const backgroundColor = tutor ? tutor.backgroundColor : '#4b5563';
  
  const options = [
    {
      id: 'full',
      name: 'Full Logs',
      description: 'View complete conversation transcripts',
      icon: <MessageSquareText size={20} className="text-white" />,
      route: `/conversation-logs/${languageId}/full`
    },
    {
      id: 'words',
      name: 'Words Learned',
      description: 'Browse vocabulary with translations',
      icon: <BookText size={20} className="text-white" />,
      route: `/conversation-logs/${languageId}/words`
    },
    {
      id: 'sentences',
      name: 'Sentences Translated',
      description: 'View translated sentences and phrases',
      icon: <FileText size={20} className="text-white" />,
      route: `/conversation-logs/${languageId}/sentences`
    }
  ];
  
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
            onClick={() => navigate('/conversation-logs')}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold ml-2">{languageId} Logs</h1>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center mb-8"
        >
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor }}
          >
            <MessageSquareText size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-semibold mb-1">{languageId}</h2>
          <p className="text-white/70 text-center">Select a view option</p>
        </motion.div>
        
        <div className="space-y-4">
          {options.map(option => (
            <motion.div
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/10 rounded-lg p-4 cursor-pointer"
              onClick={() => navigate(option.route)}
            >
              <div className="flex items-center">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                  style={{ backgroundColor }}
                >
                  {option.icon}
                </div>
                <div>
                  <h3 className="font-medium">{option.name}</h3>
                  <p className="text-sm text-white/70">{option.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Layout>
  );
};

export default LanguageLogsPage; 