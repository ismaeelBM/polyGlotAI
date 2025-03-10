import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ to, label = 'Back', className = '' }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };
  
  return (
    <button 
      className={`flex items-center text-sm text-gray-600 mb-4 touch-target ${className}`} 
      onClick={handleBack}
    >
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  );
};

export default BackButton; 