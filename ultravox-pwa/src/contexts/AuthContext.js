import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing user in localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Mock login function (would connect to backend in a real app)
  const login = (credentials) => {
    // Mock user object with subscription info
    const newUser = {
      id: 'user123',
      name: 'Test User',
      email: credentials.email,
      subscription: 'free', // free, basic, premium
      credits: 12, // minutes available
      avatar: '/placeholder-avatar.png'
    };
    
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    return Promise.resolve(newUser);
  };

  // Mock anonymous login function
  const loginAnonymously = () => {
    const anonUser = {
      id: 'anon_' + Math.random().toString(36).substr(2, 9),
      name: 'Guest User',
      subscription: 'free',
      credits: 5,
      isAnonymous: true
    };
    
    setUser(anonUser);
    localStorage.setItem('user', JSON.stringify(anonUser));
    return Promise.resolve(anonUser);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    return Promise.resolve();
  };

  // Function to handle subscription upgrades
  const upgradeSubscription = (planId) => {
    if (user) {
      const updatedUser = {
        ...user,
        subscription: planId,
        credits: planId === 'basic' ? 30 : planId === 'premium' ? 999 : 5
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return Promise.resolve(updatedUser);
    }
    return Promise.reject(new Error('No user logged in'));
  };

  // Function to deduct credits when user has a conversation
  const deductCredits = (minutes) => {
    if (user) {
      // Don't deduct if user has unlimited credits (premium)
      if (user.subscription === 'premium') {
        return Promise.resolve(user);
      }
      
      const updatedUser = {
        ...user,
        credits: Math.max(0, user.credits - minutes)
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return Promise.resolve(updatedUser);
    }
    return Promise.reject(new Error('No user logged in'));
  };

  const value = {
    user,
    loading,
    login,
    loginAnonymously,
    logout,
    upgradeSubscription,
    deductCredits
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 