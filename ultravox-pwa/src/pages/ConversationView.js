import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, User, MessageSquareText } from 'lucide-react';
import Layout from '../components/Layout';
import { useProgress } from '../contexts/ProgressContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Role } from '../services/callService';

const ConversationView = () => {
  const navigate = useNavigate();
  const { languageId, date, conversationId } = useParams();
  const { getConversations } = useProgress();
  const { tutors } = useLanguage();
  
  // Find the tutor matching this language
  const tutor = tutors.find(t => t.language === languageId);
  const backgroundColor = tutor ? tutor.backgroundColor : '#4b5563';
  
  // Get conversation details
  const conversations = getConversations(languageId, date);
  const conversation = conversations[conversationId];
  
  if (!conversation) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => navigate(`/conversation-logs/${languageId}/full`)}
              className="p-2 rounded-full hover:bg-white/10"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-semibold ml-2">Conversation Not Found</h1>
          </div>
          <div className="bg-white/5 rounded-lg p-6 text-center">
            <p className="text-white/70">This conversation could not be found</p>
          </div>
        </div>
      </Layout>
    );
  }
  
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
  
  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
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
            onClick={() => navigate(`/conversation-logs/${languageId}/full`)}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold ml-2">Conversation Transcript</h1>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6 bg-white/10 rounded-lg p-4"
        >
          <div className="flex items-center mb-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
              style={{ backgroundColor }}
            >
              <MessageSquareText size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-medium">{formatDate(conversation.timestamp)}</h3>
              <p className="text-sm text-white/70">
                {formatTime(conversation.timestamp)}, 
                {' '}{Math.round(conversation.duration / 60)} minutes
              </p>
            </div>
          </div>
        </motion.div>
        
        <div className="space-y-4">
          {conversation.transcripts.map((transcript, index) => {
            const isUser = transcript.speaker === Role.USER;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-3/4 rounded-lg p-3 ${
                    isUser 
                      ? 'bg-blue-500/20 rounded-br-none' 
                      : 'bg-white/10 rounded-bl-none'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center mr-2"
                      style={{ backgroundColor: isUser ? '#3b82f6' : backgroundColor }}
                    >
                      {isUser ? (
                        <User size={12} className="text-white" />
                      ) : (
                        <MessageSquareText size={12} className="text-white" />
                      )}
                    </div>
                    <p className="text-xs text-white/70">
                      {isUser ? 'You' : tutor?.name || 'Tutor'}
                    </p>
                  </div>
                  <p>{transcript.text}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </Layout>
  );
};

export default ConversationView; 