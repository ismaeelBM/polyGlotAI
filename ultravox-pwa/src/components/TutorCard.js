import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TutorCard = ({ tutor, onClick }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  
  const handleTutorSelect = () => {
    if (onClick) {
      onClick(tutor);
    } else {
      navigate(`/tutors/${tutor.id}/scenarios`);
    }
  };
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  // Get initials for fallback
  const getInitials = () => {
    return tutor.name.charAt(0);
  };
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition duration-300 active:scale-98 active:bg-gray-50"
      onClick={handleTutorSelect}
    >
      <div className="flex items-center p-4">
        <div 
          className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0 flex items-center justify-center" 
          style={{ backgroundColor: tutor.backgroundColor }}
        >
          {imageError ? (
            <span className="text-white text-2xl font-bold">{getInitials()}</span>
          ) : (
            <img 
              src={tutor.avatar} 
              alt={tutor.name} 
              className="w-full h-full object-cover" 
              onError={handleImageError}
            />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{tutor.name}</h3>
          <div className="text-sm text-gray-500">{tutor.language} • {tutor.specialty}</div>
          <div className="text-xs mt-1 bg-gray-100 px-2 py-1 rounded-full inline-block">{tutor.level}</div>
        </div>
      </div>
    </div>
  );
};

export default TutorCard; 