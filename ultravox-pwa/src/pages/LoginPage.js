import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock } from 'lucide-react';
import Layout from '../components/Layout';
import CustomButton from '../components/ui/custom-button';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would call the login function from AuthContext
      // For now, we'll just simulate a successful login
      if (login) {
        await login(email, password);
      }
      navigate('/language-selection');
    } catch (error) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold ml-2">Login</h1>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="p-3 bg-white/10 rounded-full mb-4">
            <Lock size={24} />
          </div>
          <h2 className="text-xl font-semibold mb-1">Welcome Back</h2>
          <p className="text-white/70 text-center">Sign in to continue your language journey</p>
        </motion.div>
        
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onSubmit={handleLogin}
          className="space-y-4"
        >
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-md p-3 mb-4">
              <p className="text-sm text-white">{error}</p>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className="pt-2">
            <CustomButton
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Login
            </CustomButton>
          </div>
        </motion.form>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-white/70">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-white hover:underline focus:outline-none"
            >
              Sign up
            </button>
          </p>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default LoginPage; 