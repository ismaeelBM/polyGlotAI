import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import BackButton from '../components/BackButton';

const DifficultySelectionPage = () => {
  const { tutorId, scenarioId } = useParams();
  const { 
    selectedTutor, 
    selectedScenario, 
    difficultyLevel, 
    setDifficultyLevel,
    getTutorById, 
    getScenarioById,
    setSelectedTutor,
    setSelectedScenario
  } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  
  // If we don't have selected tutor or scenario, get them from URL parameters
  useEffect(() => {
    if ((!selectedTutor || !selectedScenario) && tutorId && scenarioId) {
      const tutor = getTutorById(tutorId);
      const scenario = getScenarioById(scenarioId);
      
      if (tutor && scenario) {
        if (!selectedTutor) setSelectedTutor(tutor);
        if (!selectedScenario) setSelectedScenario(scenario);
      } else {
        // If tutor or scenario not found, go back to tutor selection
        navigate('/tutors');
      }
    }
  }, [
    tutorId, 
    scenarioId, 
    selectedTutor, 
    selectedScenario, 
    getTutorById, 
    getScenarioById, 
    setSelectedTutor, 
    setSelectedScenario, 
    navigate
  ]);
  
  const handleStartLesson = () => {
    navigate('/conversation');
  };
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  // Get initials for fallback
  const getInitials = () => {
    return selectedTutor ? selectedTutor.name.charAt(0) : '';
  };
  
  if (!selectedTutor || !selectedScenario) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="text-2xl font-bold text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <BackButton to={`/tutors/${tutorId}/scenarios`} label="Back to scenarios" />
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4">
            <div className="flex items-center mb-4">
              <div 
                className="w-12 h-12 rounded-full overflow-hidden mr-3 flex items-center justify-center" 
                style={{ backgroundColor: selectedTutor.backgroundColor }}
              >
                {imageError ? (
                  <span className="text-white text-xl font-bold">{getInitials()}</span>
                ) : (
                  <img 
                    src={selectedTutor.avatar} 
                    alt={selectedTutor.name} 
                    className="w-full h-full object-cover" 
                    onError={handleImageError}
                  />
                )}
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
                    py-2 rounded-lg border text-center touch-target
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
                <span className="font-bold">{user?.credits || 0} minutes</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Average lesson duration: 3-5 minutes
              </div>
              <div className="text-xs text-gray-500">
                Need more credits? <span className="text-blue-600">Purchase now</span>
              </div>
            </div>
            
            <button
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition touch-target"
              onClick={handleStartLesson}
              disabled={!user || user.credits <= 0}
            >
              Start Conversation
            </button>
            
            {(!user || user.credits <= 0) && (
              <div className="text-center text-red-500 text-sm mt-2">
                You need credits to start a conversation
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DifficultySelectionPage; 