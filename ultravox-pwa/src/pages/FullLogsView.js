import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Calendar, MessageSquare } from 'lucide-react';
import Layout from '../components/Layout';
import { useProgress } from '../contexts/ProgressContext';
import { useLanguage } from '../contexts/LanguageContext';

const FullLogsView = () => {
  const navigate = useNavigate();
  const { languageId } = useParams();
  const { getConversationDates, getConversations } = useProgress();
  const { tutors } = useLanguage();
  
  // Find the tutor matching this language
  const tutor = tutors.find(t => t.language === languageId);
  const backgroundColor = tutor ? tutor.backgroundColor : '#4b5563';
  
  // Get dates with conversations
  const dates = getConversationDates(languageId);
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
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
            onClick={() => navigate(`/conversation-logs/${languageId}`)}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold ml-2">Full Conversation Logs</h1>
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
            <Calendar size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-semibold mb-1">{languageId}</h2>
          <p className="text-white/70 text-center">Select a date</p>
        </motion.div>
        
        {dates.length > 0 ? (
          <div className="space-y-4">
            {dates.map(date => {
              const conversations = getConversations(languageId, date);
              const conversationCount = Object.keys(conversations).length;
              
              return (
                <motion.div
                  key={date}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/10 rounded-lg p-4"
                >
                  <div className="mb-3">
                    <h3 className="font-medium">{formatDate(date)}</h3>
                    <p className="text-sm text-white/70">
                      {conversationCount} {conversationCount === 1 ? 'conversation' : 'conversations'}
                    </p>
                  </div>
                  
                  <div className="space-y-2 ml-4">
                    {Object.entries(conversations).map(([conversationId, details]) => {
                      // Format timestamp
                      const time = new Date(details.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      
                      // Calculate duration in minutes
                      const minutes = Math.round(details.duration / 60);
                      
                      return (
                        <motion.div
                          key={conversationId}
                          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                          className="p-2 rounded cursor-pointer"
                          onClick={() => navigate(`/conversation-logs/${languageId}/full/${date}/${conversationId}`)}
                        >
                          <div className="flex items-center">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                              style={{ backgroundColor }}
                            >
                              <MessageSquare size={16} className="text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium">Conversation at {time}</h4>
                              <p className="text-xs text-white/70">
                                {minutes} {minutes === 1 ? 'minute' : 'minutes'}, 
                                {' '}{details.transcripts.length} messages
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/5 rounded-lg p-6 text-center">
            <p className="text-white/70">No conversation logs found</p>
            <p className="text-sm text-white/50 mt-2">Start a conversation with a tutor to create logs</p>
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default FullLogsView; 