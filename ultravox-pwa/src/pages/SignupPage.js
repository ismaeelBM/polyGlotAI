import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, UserPlus } from 'lucide-react';
import Layout from '../components/Layout';
import CustomButton from '../components/ui/custom-button';
import { useAuth } from '../contexts/AuthContext';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    try {
      // In a real app, this would call the signup function from AuthContext
      // For now, we'll just simulate a successful signup
      if (signup) {
        await signup(email, password, name);
      }
      navigate('/language-selection');
    } catch (error) {
      setError('Failed to create account. Please try again.');
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
          <h1 className="text-xl font-semibold ml-2">Create Account</h1>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="p-3 bg-white/10 rounded-full mb-4">
            <UserPlus size={24} />
          </div>
          <h2 className="text-xl font-semibold mb-1">Join Polyglot</h2>
          <p className="text-white/70 text-center">Create an account to start your language journey</p>
        </motion.div>
        
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onSubmit={handleSignup}
          className="space-y-4"
        >
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-md p-3 mb-4">
              <p className="text-sm text-white">{error}</p>
            </div>
          )}
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              placeholder="John Doe"
              required
            />
          </div>
          
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
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/70 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              Create Account
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
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-white hover:underline focus:outline-none"
            >
              Log in
            </button>
          </p>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default SignupPage; 