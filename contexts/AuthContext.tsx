// Authentication Context - manages user session
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserById } from '@/utils/auth';

interface User {
  id: number;
  username: string;
  email: string;
  xp: number;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from storage on app start
  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const userData = await getUserById(parseInt(userId));
        if (userData) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function login(userData: User) {
    setUser(userData);
    await AsyncStorage.setItem('userId', userData.id.toString());
  }

  async function logout() {
    setUser(null);
    await AsyncStorage.removeItem('userId');
  }

  function updateUser(userData: User) {
    setUser(userData);
  }

  if (loading) {
    return null; // You can add a loading screen here
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
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

