import React from 'react';
import { useProgress } from '../contexts/ProgressContext';

const ProgressStats = ({ className = '' }) => {
  const { proficiencyLevel, stats } = useProgress();
  
  return (
    <div className={`text-center text-sm text-gray-500 ${className}`}>
      <div className="mb-2 font-medium">Your Stats</div>
      <div className="bg-white rounded-lg shadow-sm p-3">
        <div className="flex justify-between items-center mb-2">
          <span>Total Vocabulary:</span>
          <span className="font-semibold">{stats.wordsLearned} words</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${proficiencyLevel.percentage}%` }}
          ></div>
        </div>
        <div className="text-xs text-right mt-1">
          Tier {proficiencyLevel.level}: {proficiencyLevel.tier} ({Math.round(proficiencyLevel.percentage)}%)
        </div>
        
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-gray-500">Streak</div>
            <div className="font-bold text-lg">{stats.streak} days</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-gray-500">Time Spoken</div>
            <div className="font-bold text-lg">{stats.minutesSpoken} min</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressStats; 