import React, { createContext, useState, useContext, useEffect } from 'react';
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

  // Load stats from localStorage on initial render
  useEffect(() => {
    if (user) {
      const storedStats = localStorage.getItem(`stats_${user.id}`);
      
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }
    }
  }, [user]);

  // Save stats to localStorage when updated
  useEffect(() => {
    if (user) {
      localStorage.setItem(`stats_${user.id}`, JSON.stringify(stats));
    }
  }, [user, stats]);

  // Record a completed conversation
  const recordConversation = (tutorId, minutes) => {
    const today = new Date().toISOString();
    
    setStats(prev => ({
      ...prev,
      conversationsCompleted: prev.conversationsCompleted + 1,
      minutesSpoken: prev.minutesSpoken + minutes,
      lastPracticeDate: today
    }));
  };

  const value = {
    stats,
    recordConversation
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
} 