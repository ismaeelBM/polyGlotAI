import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ProgressProvider } from './contexts/ProgressContext';

// Pages
import HomePage from './pages/HomePage';
import TutorSelectionPage from './pages/TutorSelectionPage';
import ScenarioSelectionPage from './pages/ScenarioSelectionPage';
import DifficultySelectionPage from './pages/DifficultySelectionPage';
import ConversationPage from './pages/ConversationPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <ProgressProvider>
            <div className="app bg-gray-100 min-h-screen">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/tutors" element={<TutorSelectionPage />} />
                <Route path="/tutors/:tutorId/scenarios" element={<ScenarioSelectionPage />} />
                <Route path="/tutors/:tutorId/scenarios/:scenarioId/difficulty" element={<DifficultySelectionPage />} />
                <Route path="/conversation" element={<ConversationPage />} />
              </Routes>
            </div>
          </ProgressProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App; 