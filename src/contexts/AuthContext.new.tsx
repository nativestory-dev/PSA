import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to transform Laravel user to our User type
const transformLaravelUser = (laravelUser: any): User => {
  const profile = laravelUser.profile || {};
  
  return {
    id: laravelUser.id.toString(),
    email: laravelUser.email,
    name: laravelUser.name,
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    avatarUrl: profile.avatar_url || '',
    bio: profile.bio || '',
    phone: profile.phone || '',
    location: profile.location || '',
    role: profile.role || 'user',
    subscriptionPlan: profile.subscription_plan || 'free',
    subscriptionExpiresAt: profile.subscription_expires_at || null,
    lastLoginAt: profile.last_login_at ? new Date(profile.last_login_at) : new Date(),
    emailVerified: true,
    createdAt: new Date(laravelUser.created_at),
    updatedAt: new Date(laravelUser.updated_at),
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          const userData = await authAPI.getProfile();
          setUser(transformLaravelUser(userData));
        }
      } catch (err) {
        console.error('Session check failed:', err);
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user: userData, token } = await authAPI.login({ email, password });
      
      localStorage.setItem('auth_token', token);
      setUser(transformLaravelUser(userData));
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user: userData, token } = await authAPI.register({
        name: `${userData.first_name} ${userData.last_name}`,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.password_confirmation,
        first_name: userData.first_name,
        last_name: userData.last_name,
      });
      
      localStorage.setItem('auth_token', token);
      setUser(transformLaravelUser(userData));
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await authAPI.getProfile();
      setUser(transformLaravelUser(updatedUser));
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
