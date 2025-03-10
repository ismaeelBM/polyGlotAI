import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ProgressContext = createContext();

export function useProgress() {
  return useContext(ProgressContext);
}

export function ProgressProvider({ children }) {
  const { user } = useAuth();
  const [vocabularyItems, setVocabularyItems] = useState([]);
  const [proficiencyLevel, setProficiencyLevel] = useState({
    level: 1,
    tier: 'Beginner',
    percentage: 0
  });
  const [stats, setStats] = useState({
    conversationsCompleted: 0,
    minutesSpoken: 0,
    wordsLearned: 0,
    streak: 0,
    lastPracticeDate: null
  });

  // Load progress from localStorage on initial render
  useEffect(() => {
    if (user) {
      const storedVocabulary = localStorage.getItem(`vocabulary_${user.id}`);
      const storedProficiency = localStorage.getItem(`proficiency_${user.id}`);
      const storedStats = localStorage.getItem(`stats_${user.id}`);
      
      if (storedVocabulary) {
        setVocabularyItems(JSON.parse(storedVocabulary));
      }
      
      if (storedProficiency) {
        setProficiencyLevel(JSON.parse(storedProficiency));
      }
      
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }
      
      // Check streak
      const today = new Date().toDateString();
      const lastPractice = stats.lastPracticeDate ? new Date(stats.lastPracticeDate).toDateString() : null;
      
      if (lastPractice) {
        // Get yesterday's date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toDateString();
        
        // If last practice was before yesterday, reset streak
        if (lastPractice !== today && lastPractice !== yesterdayString) {
          setStats(prev => ({
            ...prev,
            streak: 0
          }));
        }
      }
    }
  }, [user, stats.lastPracticeDate]);

  // Save progress to localStorage when updated
  useEffect(() => {
    if (user) {
      localStorage.setItem(`vocabulary_${user.id}`, JSON.stringify(vocabularyItems));
      localStorage.setItem(`proficiency_${user.id}`, JSON.stringify(proficiencyLevel));
      localStorage.setItem(`stats_${user.id}`, JSON.stringify(stats));
    }
  }, [user, vocabularyItems, proficiencyLevel, stats]);

  // Add new vocabulary item
  const addVocabularyItem = (item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
      proficiency: 1, // 1-5 scale
      reviewCount: 0
    };
    
    setVocabularyItems(prev => [...prev, newItem]);
    updateStats('wordsLearned', stats.wordsLearned + 1);
    
    // Recalculate proficiency level
    calculateProficiencyLevel();
    
    return newItem;
  };

  // Update vocabulary item proficiency
  const updateVocabularyProficiency = (itemId, newProficiency) => {
    setVocabularyItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              proficiency: newProficiency, 
              reviewCount: item.reviewCount + 1,
              lastReviewed: new Date().toISOString()
            } 
          : item
      )
    );
    
    // Recalculate overall proficiency level
    calculateProficiencyLevel();
  };

  // Record a completed conversation
  const recordConversation = (minutes, newWords = 0) => {
    const today = new Date().toISOString();
    const lastPractice = stats.lastPracticeDate ? new Date(stats.lastPracticeDate).toDateString() : null;
    const todayString = new Date().toDateString();
    
    // Update streak if it's a new day
    let newStreak = stats.streak;
    if (lastPractice !== todayString) {
      newStreak = stats.streak + 1;
    }
    
    setStats(prev => ({
      ...prev,
      conversationsCompleted: prev.conversationsCompleted + 1,
      minutesSpoken: prev.minutesSpoken + minutes,
      wordsLearned: prev.wordsLearned + newWords,
      streak: newStreak,
      lastPracticeDate: today
    }));
  };

  // Update a specific stat
  const updateStats = (statName, value) => {
    setStats(prev => ({
      ...prev,
      [statName]: value
    }));
  };

  // Calculate proficiency level based on vocabulary and practice
  const calculateProficiencyLevel = () => {
    // This is a simplified calculation
    // In a real app, you'd have a more sophisticated algorithm
    
    // Count words with proficiency level 3+
    // We're not using solidWords directly, but it would be used in a more complex algorithm
    // const solidWords = vocabularyItems.filter(item => item.proficiency >= 3).length;
    
    // Calculate percentage based on tiers
    // Tier 1: 0-50 words (Beginner)
    // Tier 2: 51-200 words (Elementary)
    // Tier 3: 201-500 words (Intermediate)
    // Tier 4: 501-1000 words (Upper Intermediate)
    // Tier 5: 1001+ words (Advanced)
    
    let tier, level, percentage;
    const totalWords = vocabularyItems.length;
    
    if (totalWords <= 50) {
      tier = 'Beginner';
      level = 1;
      percentage = totalWords / 50 * 100;
    } else if (totalWords <= 200) {
      tier = 'Elementary';
      level = 2;
      percentage = (totalWords - 50) / 150 * 100;
    } else if (totalWords <= 500) {
      tier = 'Intermediate';
      level = 3;
      percentage = (totalWords - 200) / 300 * 100;
    } else if (totalWords <= 1000) {
      tier = 'Upper Intermediate';
      level = 4;
      percentage = (totalWords - 500) / 500 * 100;
    } else {
      tier = 'Advanced';
      level = 5;
      percentage = 100;
    }
    
    setProficiencyLevel({ level, tier, percentage });
  };

  const value = {
    vocabularyItems,
    proficiencyLevel,
    stats,
    addVocabularyItem,
    updateVocabularyProficiency,
    recordConversation,
    updateStats
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
} 