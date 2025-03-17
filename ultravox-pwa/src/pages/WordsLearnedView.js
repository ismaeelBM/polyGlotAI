import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, BookText, X } from 'lucide-react';
import Layout from '../components/Layout';
import { useProgress } from '../contexts/ProgressContext';
import { useLanguage } from '../contexts/LanguageContext';

const WordsLearnedView = () => {
  const navigate = useNavigate();
  const { languageId } = useParams();
  const { getWordsLearned } = useProgress();
  const { tutors } = useLanguage();
  
  const [selectedWord, setSelectedWord] = useState(null);
  
  // Find the tutor matching this language
  const tutor = tutors.find(t => t.language === languageId);
  const backgroundColor = tutor ? tutor.backgroundColor : '#4b5563';
  
  // Get words learned for this language
  const words = getWordsLearned(languageId);
  
  // Group words to avoid duplicates
  const groupedWords = {};
  words.forEach(word => {
    if (!groupedWords[word.word]) {
      groupedWords[word.word] = word;
    }
  });
  
  const uniqueWords = Object.values(groupedWords);
  
  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6"
      >
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(`/conversation-logs/${languageId}`)}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold ml-2">Words Learned</h1>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center mb-8"
        >
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor }}
          >
            <BookText size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-semibold mb-1">{languageId} Vocabulary</h2>
          <p className="text-white/70 text-center">Tap a word to see its translation</p>
        </motion.div>
        
        {/* Word detail modal */}
        {selectedWord && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedWord(null)}
          >
            <motion.div 
              className="bg-[#1a1a1a] rounded-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{selectedWord.word}</h3>
                <button 
                  onClick={() => setSelectedWord(null)}
                  className="p-1 rounded-full hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-white/70 mb-1">Translation</p>
                  <p className="text-lg">{selectedWord.translation}</p>
                </div>
                
                <div>
                  <p className="text-sm text-white/70 mb-1">Pronunciation</p>
                  <p className="text-lg">{selectedWord.pronunciation}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {uniqueWords.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {uniqueWords.map((word, index) => (
              <motion.div
                key={`${word.word}-${index}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-white/10 rounded-lg p-4 cursor-pointer"
                onClick={() => setSelectedWord(word)}
              >
                <p className="font-medium truncate">{word.word}</p>
                <p className="text-sm text-white/70 truncate">Click to view</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 rounded-lg p-6 text-center">
            <p className="text-white/70">No words learned yet</p>
            <p className="text-sm text-white/50 mt-2">Start a conversation with a tutor to learn vocabulary</p>
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default WordsLearnedView; 