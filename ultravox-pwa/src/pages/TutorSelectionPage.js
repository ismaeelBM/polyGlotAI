import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import TutorCard from '../components/TutorCard';
import UserProgress from '../components/UserProgress';

const TutorSelectionPage = () => {
  const { tutors, setSelectedTutor } = useLanguage();
  const navigate = useNavigate();
  
  const handleTutorSelect = (tutor) => {
    setSelectedTutor(tutor);
    navigate(`/tutors/${tutor.id}/scenarios`);
  };
  
  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">Choose Your Language Tutor</h1>
        
        <div className="space-y-4">
          {tutors.map(tutor => (
            <TutorCard 
              key={tutor.id} 
              tutor={tutor} 
              onClick={handleTutorSelect} 
            />
          ))}
        </div>
        
        <UserProgress className="mt-6" />
      </div>
    </div>
  );
};

export default TutorSelectionPage; 