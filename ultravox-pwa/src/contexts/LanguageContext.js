import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }) {
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [tutors] = useState([
    {
      id: 1,
      name: "Aeya",
      language: "French",
      specialty: "Casual Conversation",
      description: "A Parisian native who loves discussing art, cuisine, and daily life in France. Perfect for learners who want to sound like a local.",
      avatar: "https://ui-avatars.com/api/?name=Aeya&background=3b82f6&color=fff",
      backgroundColor: "#3b82f6",
      level: "All Levels",
      voice: "Alize-French"
    },
    {
      id: 2,
      name: "Marco",
      language: "Italian",
      specialty: "Travel Phrases",
      description: "A friendly guide from Florence who specializes in travel-related vocabulary and cultural insights for your Italian adventures.",
      avatar: "https://ui-avatars.com/api/?name=Marco&background=10b981&color=fff",
      backgroundColor: "#10b981",
      level: "Beginner to Intermediate",
      voice: "Giovanni-Italian"
    },
    {
      id: 3,
      name: "Yuki",
      language: "Japanese",
      specialty: "Business Japanese",
      description: "A Tokyo professional who can help you master formal Japanese for business settings and workplace interactions.",
      avatar: "https://ui-avatars.com/api/?name=Yuki&background=ef4444&color=fff",
      backgroundColor: "#ef4444",
      level: "Intermediate to Advanced",
      voice: "Asahi-Japanese"
    },
    {
      id: 4,
      name: "Carlos",
      language: "Spanish",
      specialty: "Everyday Conversations",
      description: "A cheerful tutor from Madrid who focuses on practical, everyday Spanish that you'll actually use.",
      avatar: "https://ui-avatars.com/api/?name=Carlos&background=f59e0b&color=fff",
      backgroundColor: "#f59e0b",
      level: "All Levels",
      voice: "Miquel-Spanish"
    },
    {
      id: 5,
      name: "Monika",
      language: "English (Indian)",
      specialty: "Business Communication",
      description: "A professional with expertise in business English and formal communication. Perfect for professional settings.",
      avatar: "https://ui-avatars.com/api/?name=Monika&background=8b5cf6&color=fff",
      backgroundColor: "#8b5cf6",
      level: "Intermediate to Advanced",
      voice: "Monika-English-Indian"
    },
    {
      id: 6,
      name: "Muyiwa",
      language: "English (Nigerian)",
      specialty: "Cultural Exchange",
      description: "A friendly tutor who specializes in cultural nuances and casual conversation with a Nigerian perspective.",
      avatar: "https://ui-avatars.com/api/?name=Muyiwa&background=059669&color=fff",
      backgroundColor: "#059669",
      level: "All Levels",
      voice: "Muyiwa-English"
    },
    {
      id: 7,
      name: "Ana",
      language: "Portuguese",
      specialty: "Travel Essentials",
      description: "A native Portuguese speaker from Portugal who helps with essential phrases for travelers and tourists.",
      avatar: "https://ui-avatars.com/api/?name=Ana&background=dc2626&color=fff",
      backgroundColor: "#dc2626",
      level: "Beginner to Intermediate",
      voice: "Ana-Portuguese"
    },
    {
      id: 8,
      name: "Haytham",
      language: "Arabic",
      specialty: "Business Arabic",
      description: "An experienced tutor who helps with formal Arabic used in business and professional settings with an Egyptian accent.",
      avatar: "https://ui-avatars.com/api/?name=Haytham&background=4b5563&color=fff",
      backgroundColor: "#4b5563",
      level: "Intermediate to Advanced",
      voice: "Haytham-Arabic-Egyptian"
    }
  ]);
  
  const [scenarios] = useState([
    { id: 1, name: "At the Café", description: "Order drinks and snacks, chat with the barista" },
    { id: 2, name: "Shopping Trip", description: "Browse items, ask questions, make purchases" },
    { id: 3, name: "Making Plans", description: "Arrange to meet friends, suggest activities" },
    { id: 4, name: "Getting Directions", description: "Ask how to get somewhere, understand directions" },
    { id: 5, name: "Business Meeting", description: "Participate in a professional meeting, discuss projects" },
    { id: 6, name: "Job Interview", description: "Practice common interview questions and professional responses" },
    { id: 7, name: "Restaurant Order", description: "Order food, ask about ingredients, make special requests" },
    { id: 8, name: "Phone Conversation", description: "Handle typical phone calls like making appointments or reservations" }
  ]);

  // Load saved state from local storage
  useEffect(() => {
    const savedTutor = localStorage.getItem('selectedTutor');
    const savedScenario = localStorage.getItem('selectedScenario');
    const savedDifficulty = localStorage.getItem('difficultyLevel');
    
    if (savedTutor) setSelectedTutor(JSON.parse(savedTutor));
    if (savedScenario) setSelectedScenario(JSON.parse(savedScenario));
    if (savedDifficulty) setDifficultyLevel(parseInt(savedDifficulty));
  }, []);

  // Save state to local storage when changed
  useEffect(() => {
    if (selectedTutor) {
      localStorage.setItem('selectedTutor', JSON.stringify(selectedTutor));
    }
    if (selectedScenario) {
      localStorage.setItem('selectedScenario', JSON.stringify(selectedScenario));
    }
    localStorage.setItem('difficultyLevel', difficultyLevel.toString());
  }, [selectedTutor, selectedScenario, difficultyLevel]);

  // Clear selections
  const clearSelections = () => {
    setSelectedTutor(null);
    setSelectedScenario(null);
    setDifficultyLevel(1);
    localStorage.removeItem('selectedTutor');
    localStorage.removeItem('selectedScenario');
    localStorage.setItem('difficultyLevel', '1');
  };

  // Find a tutor by ID
  const getTutorById = (id) => {
    return tutors.find(tutor => tutor.id === parseInt(id));
  };

  // Find a scenario by ID
  const getScenarioById = (id) => {
    return scenarios.find(scenario => scenario.id === parseInt(id));
  };

  const value = {
    tutors,
    scenarios,
    selectedTutor,
    setSelectedTutor,
    selectedScenario,
    setSelectedScenario,
    difficultyLevel,
    setDifficultyLevel,
    clearSelections,
    getTutorById,
    getScenarioById
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
} 