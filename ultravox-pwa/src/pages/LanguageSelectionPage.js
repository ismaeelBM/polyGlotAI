import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Globe, Check } from 'lucide-react';
import Layout from '../components/Layout';
import CustomButton from '../components/ui/custom-button';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSelectionPage = () => {
  const navigate = useNavigate();
  const { tutors, setSelectedTutor } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Extract unique languages from tutors
  const languages = tutors.reduce((acc, tutor) => {
    const existingLanguage = acc.find(lang => lang.name === tutor.language);
    if (!existingLanguage) {
      acc.push({
        id: tutor.language.toLowerCase().replace(/\s+/g, '-'),
        name: tutor.language,
        flag: getFlagForLanguage(tutor.language)
      });
    }
    return acc;
  }, []);

  const handleLanguageSelect = (languageId) => {
    setSelectedLanguage(languageId);
    setIsDropdownOpen(false);
  };

  const handleContinue = () => {
    if (selectedLanguage) {
      // Find tutors for this language
      const tutorsForLanguage = tutors.filter(
        tutor => tutor.language.toLowerCase().replace(/\s+/g, '-') === selectedLanguage
      );
      
      // If there's only one tutor for this language, select it automatically
      if (tutorsForLanguage.length === 1) {
        setSelectedTutor(tutorsForLanguage[0]);
      }
      
      navigate('/tutor');
    }
  };

  const selectedLanguageObj = languages.find(lang => lang.id === selectedLanguage);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center mb-10"
        >
          <motion.div 
            className="p-3 bg-white/10 rounded-full mb-6"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Globe size={32} />
          </motion.div>
          <h1 className="text-2xl font-semibold mb-2">Welcome to Polyglot!</h1>
          <p className="text-white/80 text-center">Select a language to learn</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8 relative"
        >
          <div 
            className="bg-white/10 border border-white/20 rounded-md p-4 flex justify-between items-center cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {selectedLanguage ? (
              <div className="flex items-center gap-3">
                <span className="text-lg">{selectedLanguageObj?.flag}</span>
                <span>{selectedLanguageObj?.name}</span>
              </div>
            ) : (
              <span className="text-white/70">Choose a language</span>
            )}
            <ChevronDown 
              size={20} 
              className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </div>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute z-10 w-full mt-2 bg-[#1a1a1a] border border-white/20 rounded-md overflow-hidden"
              >
                <div className="max-h-60 overflow-y-auto">
                  {languages.map((language) => (
                    <motion.div
                      key={language.id}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                      className="p-3 flex items-center gap-3 cursor-pointer"
                      onClick={() => handleLanguageSelect(language.id)}
                    >
                      <span className="text-lg">{language.flag}</span>
                      <span>{language.name}</span>
                      {selectedLanguage === language.id && (
                        <Check size={16} className="ml-auto" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <CustomButton
            className="w-full"
            disabled={!selectedLanguage}
            onClick={handleContinue}
          >
            Continue
          </CustomButton>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

// Helper function to get flag emoji for a language
function getFlagForLanguage(language) {
  const flagMap = {
    'French': '🇫🇷',
    'Italian': '🇮🇹',
    'Japanese': '🇯🇵',
    'Spanish': '🇪🇸',
    'Hindi': '🇮🇳',
    'English (Nigerian)': '🇳🇬',
    'Portuguese': '🇵🇹',
    'Arabic': '🇪🇬',
    // Add more mappings as needed
  };
  
  return flagMap[language] || '🌐';
}

export default LanguageSelectionPage; 