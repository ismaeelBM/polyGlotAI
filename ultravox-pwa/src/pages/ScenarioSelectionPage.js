import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import BackButton from '../components/BackButton';
import ScenarioCard from '../components/ScenarioCard';

const ScenarioSelectionPage = () => {
  const { tutorId } = useParams();
  const { scenarios, getTutorById, selectedTutor, setSelectedTutor, setSelectedScenario } = useLanguage();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  
  // If we don't have a selected tutor, get it from the URL parameter
  useEffect(() => {
    if (!selectedTutor && tutorId) {
      const tutor = getTutorById(tutorId);
      if (tutor) {
        setSelectedTutor(tutor);
      } else {
        // If tutor not found, go back to tutor selection
        navigate('/tutors');
      }
    }
  }, [tutorId, selectedTutor, getTutorById, setSelectedTutor, navigate]);
  
  const handleScenarioSelect = (scenario) => {
    setSelectedScenario(scenario);
    navigate(`/tutors/${tutorId}/scenarios/${scenario.id}/difficulty`);
  };
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  // Get initials for fallback
  const getInitials = () => {
    return selectedTutor ? selectedTutor.name.charAt(0) : '';
  };
  
  if (!selectedTutor) {
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
        <BackButton to="/tutors" label="Back to tutors" />
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div 
            className="h-32 flex justify-center items-center" 
            style={{ backgroundColor: selectedTutor.backgroundColor }}
          >
            <div className="w-20 h-20 bg-white rounded-full overflow-hidden border-4 border-white flex items-center justify-center">
              {imageError ? (
                <div 
                  className="w-full h-full flex items-center justify-center" 
                  style={{ backgroundColor: selectedTutor.backgroundColor }}
                >
                  <span className="text-white text-3xl font-bold">{getInitials()}</span>
                </div>
              ) : (
                <img 
                  src={selectedTutor.avatar} 
                  alt={selectedTutor.name} 
                  className="w-full h-full object-cover" 
                  onError={handleImageError}
                />
              )}
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
                  <ScenarioCard 
                    key={scenario.id} 
                    scenario={scenario} 
                    tutorId={selectedTutor.id}
                    onClick={handleScenarioSelect}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioSelectionPage; 