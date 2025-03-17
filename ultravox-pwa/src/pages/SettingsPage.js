import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Settings, LogOut, Volume2, Moon, Sun } from 'lucide-react';
import Layout from '../components/Layout';
import CustomButton from '../components/ui/custom-button';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [volume, setVolume] = useState(80);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      if (logout) {
        await logout();
      }
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolumeChange = (e) => {
    setVolume(parseInt(e.target.value));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6"
      >
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold ml-2">Settings</h1>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="p-3 bg-white/10 rounded-full mb-4">
            <Settings size={24} />
          </div>
          <h2 className="text-xl font-semibold mb-1">App Settings</h2>
          <p className="text-white/70 text-center">Customize your experience</p>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-6"
        >
          {/* Volume Control */}
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Volume2 size={18} className="mr-2" />
                <span>Volume</span>
              </div>
              <span className="text-sm text-white/70">{volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          {/* Dark Mode Toggle */}
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {darkMode ? (
                  <Moon size={18} className="mr-2" />
                ) : (
                  <Sun size={18} className="mr-2" />
                )}
                <span>Dark Mode</span>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  darkMode ? 'bg-green-500' : 'bg-white/20'
                }`}
              >
                <motion.div
                  className="w-4 h-4 bg-white rounded-full"
                  animate={{ x: darkMode ? 24 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>
          
          {/* User Info */}
          {user && (
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-sm text-white/70 mb-2">Account</h3>
              <p className="mb-1">{user.displayName || 'User'}</p>
              <p className="text-sm text-white/70">{user.email || 'Anonymous'}</p>
            </div>
          )}
          
          {/* Logout Button */}
          <div className="pt-4">
            <CustomButton
              variant="outline"
              className="w-full"
              onClick={handleLogout}
              isLoading={isLoading}
            >
              <div className="flex items-center justify-center gap-2">
                <LogOut size={18} />
                <span>Logout</span>
              </div>
            </CustomButton>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default SettingsPage; 