import React, { useState } from 'react';

const LanguageLearningApp = () => {
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  
  const tutors = [
    {
      id: 1,
      name: "Aeya",
      language: "French",
      specialty: "Casual Conversation",
      description: "A Parisian native who loves discussing art, cuisine, and daily life in France. Perfect for learners who want to sound like a local.",
      avatar: "/api/placeholder/120/120",
      backgroundColor: "#3b82f6",
      level: "All Levels"
    },
    {
      id: 2,
      name: "Marco",
      language: "Italian",
      specialty: "Travel Phrases",
      description: "A friendly guide from Florence who specializes in travel-related vocabulary and cultural insights for your Italian adventures.",
      avatar: "/api/placeholder/120/120",
      backgroundColor: "#10b981",
      level: "Beginner to Intermediate"
    },
    {
      id: 3,
      name: "Yuki",
      language: "Japanese",
      specialty: "Business Japanese",
      description: "A Tokyo professional who can help you master formal Japanese for business settings and workplace interactions.",
      avatar: "/api/placeholder/120/120",
      backgroundColor: "#ef4444",
      level: "Intermediate to Advanced"
    },
    {
      id: 4,
      name: "Carlos",
      language: "Spanish",
      specialty: "Everyday Conversations",
      description: "A cheerful tutor from Madrid who focuses on practical, everyday Spanish that you'll actually use.",
      avatar: "/api/placeholder/120/120",
      backgroundColor: "#f59e0b",
      level: "All Levels"
    }
  ];
  
  const scenarios = [
    { id: 1, name: "At the Café", description: "Order drinks and snacks, chat with the barista" },
    { id: 2, name: "Shopping Trip", description: "Browse items, ask questions, make purchases" },
    { id: 3, name: "Making Plans", description: "Arrange to meet friends, suggest activities" },
    { id: 4, name: "Getting Directions", description: "Ask how to get somewhere, understand directions" }
  ];
  
  const handleTutorSelect = (tutor) => {
    setSelectedTutor(tutor);
    setSelectedScenario(null);
  };
  
  const handleBack = () => {
    if (selectedScenario) {
      setSelectedScenario(null);
    } else {
      setSelectedTutor(null);
    }
  };
  
  const handleStartLesson = () => {
    alert(`Starting lesson with ${selectedTutor.name} on "${selectedScenario.name}" at difficulty level ${difficultyLevel}`);
  };
  
  // Tutor selection screen
  if (!selectedTutor) {
    return (
      <div className="bg-gray-100 min-h-screen p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-6">Choose Your Language Tutor</h1>
          
          <div className="space-y-4">
            {tutors.map(tutor => (
              <div 
                key={tutor.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition duration-300"
                onClick={() => handleTutorSelect(tutor)}
              >
                <div className="flex items-center p-4">
                  <div 
                    className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0" 
                    style={{ backgroundColor: tutor.backgroundColor }}
                  >
                    <img src={tutor.avatar} alt={tutor.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{tutor.name}</h3>
                    <div className="text-sm text-gray-500">{tutor.language} • {tutor.specialty}</div>
                    <div className="text-xs mt-1 bg-gray-100 px-2 py-1 rounded-full inline-block">{tutor.level}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <div className="mb-2 font-medium">Your Stats</div>
            <div className="bg-white rounded-lg shadow-sm p-3">
              <div className="flex justify-between items-center mb-2">
                <span>Total Vocabulary:</span>
                <span className="font-semibold">127 words</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <div className="text-xs text-right mt-1">Tier 2: Elementary (45%)</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Tutor details and scenario selection
  if (selectedTutor && !selectedScenario) {
    return (
      <div className="bg-gray-100 min-h-screen p-4">
        <div className="max-w-md mx-auto">
          <button 
            className="flex items-center text-sm text-gray-600 mb-4" 
            onClick={handleBack}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to tutors
          </button>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div 
              className="h-32 flex justify-center items-center" 
              style={{ backgroundColor: selectedTutor.backgroundColor }}
            >
              <div className="w-20 h-20 bg-white rounded-full overflow-hidden border-4 border-white">
                <img src={selectedTutor.avatar} alt={selectedTutor.name} className="w-full h-full object-cover" />
              </div>
            </div>
            
            <div className="p-4">
              <h2 className="text-2xl font-bold text-center">{selectedTutor.name}</h2>
              <div className="text-center text-gray-600 mb-3">{selectedTutor.language} Tutor • {selectedTutor.specialty}</div>
              
              <p className="text-gray-700 mb-4">{selectedTutor.description}</p>
              
              <div className="border-t border-gray-200 pt-4 mt-2">
                <h3 className="font-semibold mb-2">Choose a Scenario:</h3>
                <div className="space-y-2">
                  {scenarios.map(scenario => (
                    <div 
                      key={scenario.id} 
                      className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition"
                      onClick={() => setSelectedScenario(scenario)}
                    >
                      <div className="font-medium">{scenario.name}</div>
                      <div className="text-sm text-gray-600">{scenario.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Difficulty selection and start lesson
  if (selectedTutor && selectedScenario) {
    return (
      <div className="bg-gray-100 min-h-screen p-4">
        <div className="max-w-md mx-auto">
          <button 
            className="flex items-center text-sm text-gray-600 mb-4" 
            onClick={handleBack}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to scenarios
          </button>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <div className="flex items-center mb-4">
                <div 
                  className="w-12 h-12 rounded-full overflow-hidden mr-3" 
                  style={{ backgroundColor: selectedTutor.backgroundColor }}
                >
                  <img src={selectedTutor.avatar} alt={selectedTutor.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="font-bold">{selectedTutor.name}</h2>
                  <div className="text-sm text-gray-600">{selectedTutor.language} Tutor</div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">Scenario: {selectedScenario.name}</h3>
                <p className="text-gray-700">{selectedScenario.description}</p>
                
                <div className="flex items-center mt-3 text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  You may learn 8-12 new phrases in this lesson
                </div>
              </div>
              
              <h3 className="font-semibold mb-3">Select Difficulty:</h3>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[1, 2, 3].map(level => (
                  <button
                    key={level}
                    className={`
                      py-2 rounded-lg border text-center
                      ${difficultyLevel === level ? 
                        'bg-blue-100 border-blue-500 text-blue-700' : 
                        'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }
                    `}
                    onClick={() => setDifficultyLevel(level)}
                  >
                    {level === 1 ? "Beginner" : level === 2 ? "Intermediate" : "Advanced"}
                  </button>
                ))}
              </div>
              
              <div className="mb-6">
                <div className="mb-2 flex justify-between items-center">
                  <span className="text-sm font-medium">Your Credit Balance:</span>
                  <span className="font-bold">12 minutes</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Average lesson duration: 3-5 minutes
                </div>
                <div className="text-xs text-gray-500">
                  Need more credits? <span className="text-blue-600">Purchase now</span>
                </div>
              </div>
              
              <button
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                onClick={handleStartLesson}
              >
                Start Conversation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
};

export default LanguageLearningApp;