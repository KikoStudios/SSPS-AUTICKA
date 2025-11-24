'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserData {
  role?: string;
  createdAt?: string;
  permissions?: string[];
  isActive?: boolean;
  plugins?: string; // Comma-separated list of plugin names
}

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  userData: UserData | null;
  userId: string | null;
  login: (username: string, userData: UserData, userId: string) => void;
  logout: () => void;
  refreshUserData: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount with session validation
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedAuth = localStorage.getItem('authData');
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          const { username: storedUsername, userData: storedUserData, userId: storedUserId, timestamp } = authData;
          
          // Check if session is still valid (24 hours)
          const sessionAge = Date.now() - (timestamp || 0);
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours
          
          if (sessionAge < maxAge && storedUsername && storedUserId) {
            setIsAuthenticated(true);
            setUsername(storedUsername);
            setUserData(storedUserData);
            setUserId(storedUserId);
          } else {
            // Session expired, clear storage
            localStorage.removeItem('authData');
          }
        }
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        localStorage.removeItem('authData');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (username: string, userData: UserData, userId: string) => {
    setIsAuthenticated(true);
    setUsername(username);
    setUserData(userData);
    setUserId(userId);
    
    // Store in localStorage for persistence with timestamp
    localStorage.setItem('authData', JSON.stringify({
      username,
      userData,
      userId,
      timestamp: Date.now()
    }));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsername(null);
    setUserData(null);
    setUserId(null);
    
    // Clear localStorage
    localStorage.removeItem('authData');
  };

  const refreshUserData = () => {
    // Update timestamp and refresh user data from localStorage
    const storedAuth = localStorage.getItem('authData');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        const updatedAuthData = {
          ...authData,
          timestamp: Date.now()
        };
        localStorage.setItem('authData', JSON.stringify(updatedAuthData));
        
        // Update the auth context state with fresh data from localStorage
        if (authData.userData !== userData) {
          setUserData(authData.userData);
        }
        
        // Note: Removed automatic dashboard refresh to prevent navigation loops
        // Dashboard will refresh naturally when userData changes
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      username,
      userData,
      userId,
      login,
      logout,
      refreshUserData,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
