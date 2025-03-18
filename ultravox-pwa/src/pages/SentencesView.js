import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, FileText, X } from 'lucide-react';
import Layout from '../components/Layout';
import { useProgress } from '../contexts/ProgressContext';
import { useLanguage } from '../contexts/LanguageContext';

const SentencesView = () => {
  const navigate = useNavigate();
  const { languageId } = useParams();
  const { getSentencesTranslated } = useProgress();
  const { tutors } = useLanguage();
  
  const [selectedSentence, setSelectedSentence] = useState(null);
  
  // Find the tutor matching this language
  const tutor = tutors.find(t => t.language === languageId);
  const backgroundColor = tutor ? tutor.backgroundColor : '#4b5563';
  
  // Get sentences translated for this language
  const sentences = getSentencesTranslated(languageId);
  
  // Group sentences to avoid duplicates
  const groupedSentences = {};
  sentences.forEach(sentence => {
    if (!groupedSentences[sentence.sentence]) {
      groupedSentences[sentence.sentence] = sentence;
    }
  });
  
  const uniqueSentences = Object.values(groupedSentences);
  
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
          <h1 className="text-xl font-semibold ml-2">Sentences Translated</h1>
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
            <FileText size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-semibold mb-1">{languageId} Sentences</h2>
          <p className="text-white/70 text-center">Tap a sentence to see its translation</p>
        </motion.div>
        
        {/* Sentence detail modal */}
        {selectedSentence && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSentence(null)}
          >
            <motion.div 
              className="bg-[#1a1a1a] rounded-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Translation Details</h3>
                <button 
                  onClick={() => setSelectedSentence(null)}
                  className="p-1 rounded-full hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-white/70 mb-1">Original</p>
                  <p className="text-lg">{selectedSentence.sentence}</p>
                </div>
                
                <div>
                  <p className="text-sm text-white/70 mb-1">Translation</p>
                  <p className="text-lg">{selectedSentence.translation}</p>
                </div>
                
                <div>
                  <p className="text-sm text-white/70 mb-1">Pronunciation</p>
                  <p className="text-lg">{selectedSentence.pronunciation}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {uniqueSentences.length > 0 ? (
          <div className="space-y-3">
            {uniqueSentences.map((sentence, index) => (
              <motion.div
                key={`${index}-${sentence.sentence.slice(0, 10)}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/10 rounded-lg p-4 cursor-pointer"
                onClick={() => setSelectedSentence(sentence)}
              >
                <p className="font-medium line-clamp-2">{sentence.sentence}</p>
                <p className="text-sm text-white/70 mt-1">Click to view translation</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 rounded-lg p-6 text-center">
            <p className="text-white/70">No sentences translated yet</p>
            <p className="text-sm text-white/50 mt-2">Start a conversation with a tutor to learn phrases</p>
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default SentencesView; 