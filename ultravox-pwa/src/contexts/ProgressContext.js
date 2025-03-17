import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const ProgressContext = createContext();

export function useProgress() {
  return useContext(ProgressContext);
}

export function ProgressProvider({ children }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    conversationsCompleted: 0,
    minutesSpoken: 0,
    lastPracticeDate: null
  });
  
  // Add conversation logs state
  const [conversationLogs, setConversationLogs] = useState({
    conversations: {},
    wordsLearned: {},
    sentencesTranslated: {}
  });
  
  const getStorageKey = useCallback((prefix) => {
    return user ? `${prefix}_${user.id}` : `${prefix}_local`;
  }, [user]);

  // Load stats from localStorage on initial render
  useEffect(() => {
    const storedStats = localStorage.getItem(getStorageKey('stats'));
    
    if (storedStats) {
      setStats(JSON.parse(storedStats));
    }
    
    // Load conversation logs from localStorage
    const storedLogs = localStorage.getItem(getStorageKey('conversationLogs'));
    
    if (storedLogs) {
      setConversationLogs(JSON.parse(storedLogs));
    }
  }, [user, getStorageKey]);

  // Save stats to localStorage when updated
  useEffect(() => {
    localStorage.setItem(getStorageKey('stats'), JSON.stringify(stats));
  }, [user, stats, getStorageKey]);
  
  // Save conversation logs to localStorage when updated
  useEffect(() => {
    localStorage.setItem(getStorageKey('conversationLogs'), JSON.stringify(conversationLogs));
    console.log('Saved to localStorage:', conversationLogs);
  }, [user, conversationLogs, getStorageKey]);

  // Record a completed conversation
  const recordConversation = (tutor, minutes, transcripts, summary) => {
    const now = new Date();
    const today = now.toISOString();
    const dateKey = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    console.log('Recording conversation:', { tutor, minutes, transcripts, summary });
    
    // Update basic stats
    setStats(prev => ({
      ...prev,
      conversationsCompleted: prev.conversationsCompleted + 1,
      minutesSpoken: prev.minutesSpoken + minutes,
      lastPracticeDate: today
    }));
    
    // If we have transcripts and summary, store them
    if (transcripts && summary) {
      // Generate a unique conversation ID
      const conversationId = `conv_${Date.now()}`;
      
      // Get tutor language from tutorId
      const tutorLanguage = tutor.language || "Unknown";
      
      console.log('Storing conversation for language:', tutorLanguage);
      
      // Update conversation logs
      setConversationLogs(prev => {
        // Create nested structure if it doesn't exist
        const updatedConversations = { ...prev.conversations };
        if (!updatedConversations[tutorLanguage]) {
          updatedConversations[tutorLanguage] = {};
        }
        if (!updatedConversations[tutorLanguage][dateKey]) {
          updatedConversations[tutorLanguage][dateKey] = {};
        }
        
        // Add this conversation
        updatedConversations[tutorLanguage][dateKey][conversationId] = {
          transcripts,
          summary,
          duration: minutes,
          tutor,
          timestamp: today
        };
        
        // Extract words learned
        const updatedWordsLearned = { ...prev.wordsLearned };
        if (!updatedWordsLearned[tutorLanguage]) {
          updatedWordsLearned[tutorLanguage] = [];
        }
        
        if (summary.words && Array.isArray(summary.words)) {
          summary.words.forEach(word => {
            updatedWordsLearned[tutorLanguage].push({
              word: word.original,
              translation: word.translation, 
              pronunciation: word.pronunciation,
              date: today
            });
          });
        }
        
        // Extract sentences translated
        const updatedSentencesTranslated = { ...prev.sentencesTranslated };
        if (!updatedSentencesTranslated[tutorLanguage]) {
          updatedSentencesTranslated[tutorLanguage] = [];
        }
        
        if (summary.sentences && Array.isArray(summary.sentences)) {
          summary.sentences.forEach(sentence => {
            updatedSentencesTranslated[tutorLanguage].push({
              sentence: sentence.original,
              translation: sentence.translation,
              pronunciation: sentence.pronunciation,
              date: today
            });
          });
        }
        
        return {
          conversations: updatedConversations,
          wordsLearned: updatedWordsLearned,
          sentencesTranslated: updatedSentencesTranslated
        };
      });
    }
  };
  
  // Get available languages that have conversation logs
  const getLanguagesWithLogs = () => {
    return Object.keys(conversationLogs.conversations);
  };
  
  // Get conversation dates for a specific language
  const getConversationDates = (language) => {
    if (!conversationLogs.conversations[language]) {
      return [];
    }
    return Object.keys(conversationLogs.conversations[language]).sort().reverse();
  };
  
  // Get conversations for a specific language and date
  const getConversations = (language, date) => {
    if (!conversationLogs.conversations[language] || 
        !conversationLogs.conversations[language][date]) {
      return {};
    }
    return conversationLogs.conversations[language][date];
  };
  
  // Get words learned for a specific language
  const getWordsLearned = (language) => {
    return conversationLogs.wordsLearned[language] || [];
  };
  
  // Get sentences translated for a specific language
  const getSentencesTranslated = (language) => {
    return conversationLogs.sentencesTranslated[language] || [];
  };

  const value = {
    stats,
    recordConversation,
    getLanguagesWithLogs,
    getConversationDates,
    getConversations,
    getWordsLearned,
    getSentencesTranslated,
    conversationLogs
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
} 