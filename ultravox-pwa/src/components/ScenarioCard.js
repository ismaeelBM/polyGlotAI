import React from 'react';
import { useNavigate } from 'react-router-dom';

const ScenarioCard = ({ scenario, tutorId, onClick }) => {
  const navigate = useNavigate();
  
  const handleScenarioSelect = () => {
    if (onClick) {
      onClick(scenario);
    } else {
      navigate(`/tutors/${tutorId}/scenarios/${scenario.id}/difficulty`);
    }
  };
  
  return (
    <div 
      className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition active:bg-gray-100 touch-target"
      onClick={handleScenarioSelect}
    >
      <div className="font-medium">{scenario.name}</div>
      <div className="text-sm text-gray-600">{scenario.description}</div>
    </div>
  );
};

export default ScenarioCard; 