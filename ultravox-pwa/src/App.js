import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { AnimatePresence } from 'framer-motion';

// Pages
import HomePage from './pages/HomePage';
import LanguageSelectionPage from './pages/LanguageSelectionPage';
import TutorPage from './pages/TutorPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import ConversationLogsPage from './pages/ConversationLogsPage';
import LanguageLogsPage from './pages/LanguageLogsPage';
import FullLogsView from './pages/FullLogsView';
import ConversationView from './pages/ConversationView';
import WordsLearnedView from './pages/WordsLearnedView';
import SentencesView from './pages/SentencesView';

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/language-selection" element={<LanguageSelectionPage />} />
        <Route path="/tutor" element={<TutorPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/conversation-logs" element={<ConversationLogsPage />} />
        <Route path="/conversation-logs/:languageId" element={<LanguageLogsPage />} />
        <Route path="/conversation-logs/:languageId/full" element={<FullLogsView />} />
        <Route path="/conversation-logs/:languageId/full/:date/:conversationId" element={<ConversationView />} />
        <Route path="/conversation-logs/:languageId/words" element={<WordsLearnedView />} />
        <Route path="/conversation-logs/:languageId/sentences" element={<SentencesView />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <ProgressProvider>
            <AnimatedRoutes />
          </ProgressProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App; 