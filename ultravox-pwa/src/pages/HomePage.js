import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { user, loginAnonymously, loading } = useAuth();
  const navigate = useNavigate();
  
  // Auto-login anonymously if no user exists
  useEffect(() => {
    if (!loading && !user) {
      loginAnonymously();
    }
  }, [loading, user, loginAnonymously]);
  
  const handleStartLearning = () => {
    navigate('/tutors');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="text-2xl font-bold text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto pt-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700">Ultravox</h1>
          <p className="text-gray-600 mt-2">Practice languages with AI tutors</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="h-40 bg-primary-600 flex items-center justify-center">
            <img 
              src="/placeholder-illustration.svg" 
              alt="Language Learning" 
              className="h-32"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x200?text=Language+Learning';
              }}
            />
          </div>
          
          <div className="p-4">
            <h2 className="text-xl font-bold mb-2">Welcome to Ultravox</h2>
            <p className="text-gray-700 mb-4">
              Practice conversations with AI language tutors in realistic scenarios.
              Choose your tutor, scenario, and difficulty level to get started.
            </p>
            
            <button
              className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition touch-target"
              onClick={handleStartLearning}
            >
              Start Learning
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4">
            <h3 className="font-semibold mb-2">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Choose a language tutor that matches your learning goals</li>
              <li>Select a conversation scenario to practice</li>
              <li>Set your difficulty level</li>
              <li>Start the conversation and practice speaking</li>
              <li>Review new vocabulary and track your progress</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 